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

// app.get("/", (req, res) => {
// 	res.send("Hello World");
// });

// app.use("/", express.static("../facebook/build"));
// app.use("/friends", express.static("../facebook/build"));
// app.use("/watch", express.static("../facebook/build"));

app.use("/public", express.static("./public"));
// app.use(upload.array());

app.use(express.static(path.join(__dirname, "client/build")))

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
	console.log(req.file.size);

	if(req.file.size > 5000000) return res.status(500).send({message: "Larger file is not allowed to post"})

	function setUrl(file) {
		let photoURL, videoURL;
		if(!file) return;
		if (file.mimetype.match("image")) {
			photoURL = file.path;
			console.log(__dirname)
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
