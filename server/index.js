const express = require("express");

const app = express();
const port = 3001;
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(cors());

const db = new sqlite3.Database("data.db", (error) => {
	if (error) {
		throw error;
	}

	// create tables if they dont exist
	db.serialize(() => {
		db.run(
			`CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP)`
		);
	});
});

app.get("/notes", (req, res) => {
	db.all("SELECT * FROM notes", (err, rows) => {
		if (err) {
			console.error(err);
			return res.status(500).json({
				succes: false,
				message: "An error occured, please try again later",
			});
		}

		return res.json({ success: true, data: rows });
	});
});

app.get("/notes/:id", (req, res) => {
	db.get("SELECT * FROM notes WHERE id = ?", req.params.id, (err, row) => {
		if (err) {
			console.error(err);
			return res.status(500).json({
				succes: false,
				message: "An error occured, please try agai later",
			});
		}
		if (!row) {
			return res
				.status(404)
				.json({ succes: false, message: "note does not exists" });
		}

		return res.json({ succes: true, data: row });
	});
});

app.post("/notes", (req, res) => {
	const { title, content } = req.body;

	if (!title || !content) {
		return res
			.status(400)
			.json({ success: false, message: "title and content are required" });
	}

	db.run(
		"INSERT INTO notes (title, content) VALUES (?, ?)",
		[title, content],
		function (err) {
			if (err) {
				console.error(err);
				return res.status(500).json({
					succes: false,
					message: "an error occured, please try again later",
				});
			}

			return res.json({
				success: true,
				data: {
					id: this.lastID,
					title,
					content,
				},
			});
		}
	);
});

app.delete("/notes/:id", (req, res) => {
	const { id } = req.params;

	db.get("SELECT * FROM notes WHERE id = ?", [id], (err, row) => {
		if (err) {
			console.error(err);
			return res.status(500).json({
				success: false,
				message: "an error occured, please try again later",
			});
		}

		if (!row) {
			return res
				.status(404)
				.json({ success: false, message: "note does not exists" });
		}

		db.run("DELETE FROM notes WHERE id = ?", [id], (err) => {
			if (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "an error occured, please try again later",
				});
			}
			return res.json({ success: true, message: "note deleted successfully" });
		});
	});
});

app.listen(port, () => {
	console.log(`notes app listening on port ${port}`);
});
