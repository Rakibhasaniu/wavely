'use client';

import { createReply, fetchReplies, toggleReplyLike } from '@/store/slices/replySlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
import Avatar from '../shared/Avatar';
import LikesModal from './LikesModal';

export default function ReplySection({ commentId }: { commentId: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const replyData = useAppSelector((s) => s.replies.byCommentId[commentId]);
  const [text, setText] = useState('');
  const [likesFor, setLikesFor] = useState<string | null>(null);

  useEffect(() => {
    if (!replyData) {
      dispatch(fetchReplies(commentId));
    }
  }, [dispatch, commentId, replyData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await dispatch(createReply({ commentId, text }));
    setText('');
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  };

  const replies = replyData?.replies || [];

  return (
    <div style={{ paddingLeft: 44, marginTop: 8 }}>
      {replies.map((reply) => {
        const isLiked = reply.likedByMe ?? reply.likes?.some((u) => u._id === user?._id);
        return (
          <div key={reply._id} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <Avatar src={reply.author.avatar} name={reply.author.firstName} size={28} />
            <div style={{ flex: 1 }}>
              <div
                className="_comment_details"
                style={{ marginBottom: 4, position: 'relative', display: 'inline-block', minWidth: 120 }}
              >
                <h4 className="_comment_name_title">
                  {reply.author.firstName} {reply.author.lastName}
                </h4>
                <p className="_comment_status_text">{reply.text}</p>

                {reply.likesCount > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -12,
                      right: 8,
                      background: '#fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      borderRadius: 12,
                      padding: '2px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontWeight: 500,
                      zIndex: 1,
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#377DFF" stroke="#377DFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    <span style={{ cursor: 'pointer' }} onClick={() => setLikesFor(reply._id)}>{reply.likesCount}</span>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: reply.likesCount > 0 ? 14 : 2,
                  paddingLeft: 4,
                }}
              >
                <button
                  type="button"
                  onClick={() => dispatch(toggleReplyLike({ replyId: reply._id, commentId }))}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: isLiked ? '#377DFF' : 'var(--color6)',
                  }}
                >
                  Like
                </button>
                <span style={{ fontSize: 11, color: 'var(--color7)' }}>
                  {timeAgo(reply.createdAt)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 8 }}>
        <Avatar src={user?.avatar} name={user?.firstName || 'U'} size={28} />
        <form
          onSubmit={handleSubmit}
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <textarea
            className="form-control _comment_textarea"
            placeholder="Write a reply..."
            value={text}
            rows={1}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (text.trim()) handleSubmit(e as unknown as React.FormEvent);
              }
            }}
            style={{ resize: 'none', borderRadius: 20, fontSize: 13 }}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="_feed_inner_comment_box_icon_btn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 14 13">
              <path fill="#377DFF" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
      {likesFor && (
        <LikesModal targetType="replies" targetId={likesFor} onClose={() => setLikesFor(null)} />
      )}
    </div>
  );
}
