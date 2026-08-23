import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';

function TicketComments({ comments, loading, posting, error, onAddComment }) {
  const [comment, setComment] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      return;
    }

    const success = await onAddComment(trimmedComment);

    if (success) {
      setComment('');
    }
  };

  return (
    <div className="ticket-details-card">
      <div className="ticket-card-heading">
        <div>
          <h2>Comments</h2>

          <p>Discussion and review notes for this ticket.</p>
        </div>

        <MessageSquare size={20} />
      </div>

      {loading && <p className="ticket-loading-text">Loading comments...</p>}

      {!loading && comments.length === 0 && (
        <div className="ticket-empty-state">
          No comments have been added yet.
        </div>
      )}

      {!loading && comments.length > 0 && (
        <div className="comment-list">
          {comments.map((item) => (
            <article className="comment-card" key={item.id}>
              <div className="comment-header">
                <div>
                  <strong>{item.username}</strong>

                  {item.user_role && (
                    <span className="comment-role">{item.user_role}</span>
                  )}
                </div>

                <time>{new Date(item.created_at).toLocaleString()}</time>
              </div>

              <p>{item.comment}</p>
            </article>
          ))}
        </div>
      )}

      <form className="comment-form" onSubmit={handleSubmit}>
        <label htmlFor="ticket-comment">Add comment</label>

        <textarea
          id="ticket-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows="4"
          placeholder="Add a review note, technical update or discussion comment..."
          disabled={posting}
        />

        {error && <p className="error">{error}</p>}

        <div className="comment-form-actions">
          <span>
            Your authenticated user and role are recorded automatically.
          </span>

          <button
            type="submit"
            className="primary-button"
            disabled={posting || !comment.trim()}
          >
            <Send size={15} />

            {posting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TicketComments;
