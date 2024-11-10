<>
  <UserHeader />
  <div className="collaboration-container">
    {isReconnecting && (
      <div className="reconnecting-overlay">
        <div className="reconnecting-message">
          <CircularProgress size={24} />
          <span>
            {reconnectAttempts < maxReconnectAttempts
              ? `Reconnecting... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`
              : 'Connection lost. Please rejoin from dashboard.'}
          </span>
        </div>
      </div>
    )}
    <div className="question-section">
      <h2 className="question-title">
        {question.questionTitle}
      </h2>
      <div className="question-meta">
        <span className="badge category">Category: {question.questionCategory}</span>
        <span className="badge difficulty">Difficulty: {difficulty}</span>
      </div>
      <div className="question-description">
        <p>{question.questionDescription}</p>
      </div>
    </div>

    <div className="workspace">
      <div className="editor-section">
        <Editor
          height="70vh"
          theme="vs-dark"
          defaultValue='// Start collaborating and write your code\nconsole.log("Hello World!");'
          defaultLanguage="javascript"
          options={{
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            folding: true,
            automaticLayout: true,
          }}
          onMount={editor => {
            setEditor(editor);
            setEditorContent(editor.getValue());
          }} />
        <div className="editor-actions">
          <button
            className="btn-save"
            onClick={endSession}
          >
            End Session
          </button>
        </div>
      </div>
      <div className="chat-section">
        <div className="chat-messages" id="chat-messages">
          {userLeft && (
            <div className="system-message fade-out">
              An user has left the session. You can continue coding or end your session.
            </div>
          )}
          {messageList.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.username}</strong>: {msg.message} <span className="timestamp">({new Date(msg.timestamp).toLocaleTimeString()})</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  </div>
</>