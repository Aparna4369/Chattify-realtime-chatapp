import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  chatName: {
    type: String,
    trim: true,
  },
  isGroupChat: {
    type: Boolean,
    default: false,
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  unreadCounts: {      
    type: Object,       
    default: {},
  },
 
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function() {
      return this.isGroupChat;
    }
  },
  adminSettings: {
    type: Object,
    default: {
      canAddMembers: true,
      onlyAdminCanDelete: true,
      adminPermissions: ['add_members', 'remove_members', 'delete_group']
    }
  }
}, {
  timestamps: true,
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;