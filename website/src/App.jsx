// import { PlusIcon, RefreshIcon } from "@heroicons/react/solid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Form from "./components/Form";

function App() {
	const { isLoading, isError, data, error } = useQuery(["notes"], fetchNotes);
	const [isOpen, setIsOpen] = useState(false);
	const queryClient = useQueryClient();
	const mutation = useMutation(deleteNote, {
		onSuccess: () => queryClient.invalidateQueries("notes"),
	});

	function fetchNotes() {
		return fetch("http://localhost:3001/notes")
			.then((res) => res.json())
			.then(({ success, data }) => {
				if (!success) {
					throw new Error("an error occured while fetching data");
				}
				return data;
			});
	}

	function addNote() {
		setIsOpen(true);
	}

	function deleteNote(note) {
		return fetch(`http://localhost:3001/notes/${note.id}`, {
			method: "DELETE",
		})
			.then((res) => res.json())
			.then(({ success, message }) => {
				if (!success) {
					throw new Error(message);
				}
				alert(message);
			});
	}

	return (
		<div className="App w-screen min-h-screen bg-red-400 flex flex-col justify-center items-center">
			<div className="bg-white w-full md:w-1/2 p-5 text-center rounded shadow-md text-gray-800 prose">
				<h1>notes</h1>
				{(isLoading || mutation.isLoading) && <p>loading...</p>}
				{(isError || mutation.isError) && (
					<span className="text-red">
						{error.message ? error.message : error}
					</span>
				)}
				{!isLoading && !isError && data && !data.length && (
					<span className="text-red-400">you have no notes</span>
				)}
				{data &&
					data.length > 0 &&
					data.map((note, index) => (
						<div
							key={note.id}
							className={`text-left ${
								index !== data.length - 1 ? "border-b pb-2" : ""
							}`}
						>
							<h2>{note.title}</h2>
							<p>{note.content}</p>
							<span>
								<button
									className="link text-gray-400"
									onClick={() => mutation.mutate(note)}
								>
									delete
								</button>
							</span>
						</div>
					))}
			</div>
			<button
				className="mt-2 bg-gray-700 hover:bg-gray-600 rounded-full text-white p-3"
				onClick={addNote}
			>
				+
			</button>
			<Form isOpen={isOpen} setIsOpen={setIsOpen} />
		</div>
	);
}

export default App;
