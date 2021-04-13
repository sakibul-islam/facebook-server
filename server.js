const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const Post = require("./models/posts");

var multer = require("multer");

const { graphqlHTTP } = require("express-graphql");
const { rootSchema } = require("./graphql/root-schema");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/facebook", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

app.use(cors());
app.use(
	"/graphql",
	graphqlHTTP({
		schema: rootSchema,
		graphiql: true,
	})
);
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.use("/public", express.static("./public"));
// app.use(upload.array());

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./public/uploads");
	},
	filename: function (req, file, cb) {
		cb(null, new Date().getTime().toString() + path.extname(file.originalname));
	},
	// fileFilter: function (req, file, cb) {
	// 	if(file) {
	// 		cb(null, true);
	// 	} else {
	// 		cb(null, false)
	// 	}
	// }
});

const upload = multer({ storage: storage });

app.post("/post/new", upload.single("photo"), function (req, res, next) {
	console.log(req.body);
	console.log(req.file);

	function setUrl(file) {
		let photoURL, videoURL;

		if (file.mimetype.match("image")) {
			photoURL = "http://localhost:3001/" + file.path;
			return {photoURL}
		} else if (file.mimetype.match("video")) {
			videoURL = "http://localhost:3001/" + file.path;
			return {videoURL}
		}
	}
	console.log(setUrl(req.file))
	function savePostToDatabase(req) {
		const {userName, caption} = req.body;
		const url = setUrl(req.file);
		const post = new Post({
			userName,
			body: {
				caption,
				...url
			},
		});
		return post.save();
	}
	savePostToDatabase(req).then(console.log);
	res.send(200);
});

app.get("/public/uploads:");

app.listen(3001, () => {
	console.log("server is listing 3001");
});
