import React from "react";
import { Segment, Comment } from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from 'react-redux';
import { setUserPosts } from '../../actions';
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Typing from './Typing';

class Messages extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref("privateMessages"),
    typingRef: firebase.database().ref('typing'),
    messagesRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    typingUsers: [],
    connectedRef: firebase.database().ref('.info/connected'),
    listeners: []
  };

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.messagesEnd){
      this.scrollToBottom();
    }
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  };

  addListeners = channelId => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId);
  };

  addTypingListener = channelId => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on('child_added', snap => {
      if(snap.key !== this.state.user.uid){
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val()
        })
        this.setState({ typingUsers });
      }
    })

    this.state.typingRef.child(channelId).on('child_removed', snap => {
      const index = typingUsers.findIndex(user => user.id === snap.key);
      if(index !== -1){
        typingUsers = typingUsers.filter(user => user.id !== snap.key);
        this.setState({ typingUsers });
      }
    })

    this.state.connectedRef.on('value', snap => {
      if(snap.val() === true){
        this.state.typingRef.child(channelId).child(this.state.user.uid)
        .onDisconnect()
        .remove(err => {
          if(err !== null){
            console.error(err);
          }
        })
      }
    })
  };

  addMessageListener = channelId => {
    let loadedMessages = [];
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", snap => {
      loadedMessages.push(snap.val());
      this.setState({
        messages: loadedMessages,
        messagesLoading: false
      });
      this.countUniqueUsers(loadedMessages);
      this.countUserPosts(loadedMessages);
    });
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  handleSearchChange = event => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    const channelMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, "gi");
    const searchResults = channelMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  countUniqueUsers = messages => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({ numUniqueUsers });
  };

  countUserPosts = messages => {
    let userPosts = messages.reduce((acc, message) => {
      if(message.user.name in acc){
        acc[message.user.name].count += 1;
      }else{
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        }
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  displayMessages = messages =>
    messages.length > 0 &&
    messages.map(message => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));

  displayChannelName = channel => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  displayTypingUsers = users => (
    users.length > 0 && users.map(user => (
      <div style={{display: "flex", alignItems: "center", marginBottom: '0.2em' }}
        key ={user.id}
      >
        <span className="user__typing">{user.name} is typing</span><Typing/>
      </div>
    ))
  );

  render() {
    // prettier-ignore
    const { messagesRef, messages, channel, user, numUniqueUsers, searchTerm, searchResults, searchLoading, privateChannel, typingUsers } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
        />

        <Segment>
          <Comment.Group className="messages">
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
              {this.displayTypingUsers(typingUsers)}
              <div ref={node => (this.messagesEnd = node)}></div>
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default connect(null , { setUserPosts })(Messages);
