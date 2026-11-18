const User = require("../models/User");

const resolvers = {

  Query: {
    users: async () => {
      return await User.find();
    },

    user: async (_, { id }) => {
      return await User.findById(id);
    }
  },

  Mutation: {

    createUser: async (_, args) => {
      const user = new User(args);
      return await user.save();
    },

    updateUser: async (_, { id, ...data }) => {
      return await User.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
    },

    deleteUser: async (_, { id }) => {
      const user = await User.findByIdAndDelete(id);
      return Boolean(user);
    }
  }
};

module.exports = resolvers;
