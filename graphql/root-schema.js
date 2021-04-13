const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLList,
  GraphQLNonNull,
} = require("graphql");
const { profiles, profileArr, friendRequests, friendSuggestions } = require("../profilesObj");
const Post = require('../models/posts');
const User = require('../models/users');

async function test() {
	// profileArr.forEach(profile => {
	// 	const {displayName, userName, nickName, photoURL, photos, bio, born} = profile
	// 	const user = new User({
	// 		displayName, userName, nickName, photoURL, photos, bio, born
	// 	})
	// 	user.save()
	// })
	// const userName = "harry"
  // console.log(await User.find({"userName" : userName}))
}
test()

const userType = new GraphQLObjectType({
	name: "User",
	description: "A user's profile",
	fields: {
		displayName: { type: GraphQLString },
		photoURL: { type: GraphQLString },
		userName: { type: GraphQLString },
		nickName: { type: GraphQLString },
		photos: {
			type: GraphQLList(GraphQLString),
		},
		bio: { type: GraphQLString },
		born: { type: GraphQLString }
	},
});

const reactionsType = new GraphQLObjectType({
	name: "Reactions",
	fields: {
		like: {type: GraphQLInt},
		haha: {type: GraphQLInt},
		love: {type: GraphQLInt},
		wow: {type: GraphQLInt},
		care: {type: GraphQLInt},
		sad: {type: GraphQLInt},
		angry: {type: GraphQLInt}
	}
})

const commentType = new GraphQLObjectType({
	name: 'comment',
	fields: {
    userName: {type: GraphQLString},
		user: {type: userType, resolve: (parent) => profiles[parent.userName]},
		body: {type: GraphQLString},
		id: { type: GraphQLString, resolve: (parent) => parent._id},
	}
})

const postBodyType = new GraphQLObjectType({
	name: 'postBody',
	fields: {
    caption: {type: GraphQLString},
    photoURL: {type: GraphQLString},
    videoURL: {type: GraphQLString}
	}
})

const postType = new GraphQLObjectType({
	name: "post",
	description: "Return a single post",
	fields: {
		id: { type: GraphQLString, resolve: (parent) => parent._id},
		time: { type: GraphQLString},
		body: {
      type: postBodyType,
    },
		userName: { type: GraphQLString },
		user: {
			type: userType,
			description: "Return a user profile",
			resolve: (parent) => profiles[parent.userName],
		},
		reactions: {
			type: reactionsType,
			description: "All the reactions the post got"
		},
		comments: {
			type: GraphQLList(commentType)
		}
	},
});

const rootQueryType = new GraphQLObjectType({
	name: "Query",
	description: "All the query",
	fields: {
		posts: {
			type: GraphQLList(postType),
			description: "Return posts",
			resolve: async () => await Post.find().sort({time: 'desc'}),
		},
		videos: {
			type: GraphQLList(postType),
			description: "Return posts",
			resolve: async () => await Post.find({"body.videoURL": { $exists: true }}),
		},
    users: {
      type: GraphQLList(userType),
      description: "A list of all users",
      resolve: () => User.find()
    },
		user: {
			type: userType,
			description: "Return a single user",
			args: {
				userName: {type: GraphQLNonNull(GraphQLString)}
			},
			resolve: async (parent, {userName}) => {
				const user = await User.find({"userName" : userName});
				console.log(user[0])
				return user[0];
			}
		},
		friendRequests: {
			type: GraphQLList(userType),
			description: "People who sent friend request",
			resolve: () => friendRequests
		},
		friendSuggestions: {
			type: GraphQLList(userType),
			description: "People You may know",
			resolve: () => friendSuggestions
		}
	},
});

const rootMutationType = new GraphQLObjectType({
	name: "Mutation",
	description: "All the mutation",
	fields: () => ({
		addPost: {
			type: postType,
			description: "Create a new post",
      args: {
        userName: { type: GraphQLNonNull(GraphQLString) },
				caption: {type: GraphQLString}
      },
			resolve: (parent, {userName, caption}) => {
				const post = new Post({
					userName,
					body: {
						caption
					}
				});
        console.log(post.save().then(console.log));
        return post;
      }
		}
	}),
});

const rootSchema = new GraphQLSchema({
	query: rootQueryType,
  mutation: rootMutationType
});

module.exports = {rootSchema}