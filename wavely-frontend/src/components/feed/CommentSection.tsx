'use client';

import { createComment, fetchComments, toggleCommentLike } from '@/store/slices/commentSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useEffect, useState } from 'react';
import Avatar from '../shared/Avatar';
import LikesModal from './LikesModal';

export default function CommentSection({ postId }: { postId: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const commentData = useAppSelector((s) => s.comments.byPostId[postId]);
  const [text, setText] = useState('');
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [likesFor, setLikesFor] = useState<string | null>(null);

  useEffect(() => {
    // fetch only when the store has nothing for this post —
    // reopening the section reuses the redux cache instead of refetching
    if (!commentData) dispatch(fetchComments({ postId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await dispatch(createComment({ postId, text }));
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

  const comments = commentData?.comments || [];

  return (
    <div className="_feed_inner_timeline_cooment_area">
      <div className="_feed_inner_comment_box">
        <form className="_feed_inner_comment_box_form" onSubmit={handleSubmit}>
          <div className="_feed_inner_comment_box_content">
            <div className="_feed_inner_comment_box_content_image">
              <Avatar src={user?.avatar} name={user?.firstName || 'U'} size={36} className="_comment_img" />
            </div>
            <div className="_feed_inner_comment_box_content_txt">
              <textarea
                className="form-control _comment_textarea"
                placeholder="Write a comment"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (text.trim()) handleSubmit(e as unknown as React.FormEvent);
                  }
                }}
              />
            </div>
          </div>
          <div className="_feed_inner_comment_box_icon">
            <button type="submit" className="_feed_inner_comment_box_icon_btn" disabled={!text.trim()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 14 13">
                <path fill="#377DFF" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      <div className="_timline_comment_main" style={{ padding: '0 16px' }}>
        {comments.map((comment) => {
          const isLiked = comment.likedByMe ?? comment.likes?.some((u) => u._id === user?._id);
          return (
            <div key={comment._id} className="_comment_main" style={{ marginBottom: 16 }}>
              <div className="_comment_image">
                <Avatar src={comment.author.avatar} name={comment.author.firstName} size={36} className="_comment_img1" />
              </div>

              <div className="_comment_area">
                <div
                  className="_comment_details"
                  style={{ marginBottom: 4, position: 'relative' }}
                >
                  <div className="_comment_name">
                    <h4 className="_comment_name_title">
                      {comment.author.firstName} {comment.author.lastName}
                    </h4>
                  </div>
                  <div className="_comment_status">
                    <p className="_comment_status_text">{comment.text}</p>
                  </div>

                  {comment.likesCount > 0 && (
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
                        fontSize: 13,
                        fontWeight: 500,
                        zIndex: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => setLikesFor(comment._id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#377DFF" stroke="#377DFF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                      </svg>
                      <span>{comment.likesCount}</span>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: comment.likesCount > 0 ? 16 : 4,
                    paddingLeft: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => dispatch(toggleCommentLike({ commentId: comment._id, postId }))}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: isLiked ? '#377DFF' : 'var(--color6)',
                    }}
                  >
                    Like
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpenReplies((prev) => ({ ...prev, [comment._id]: !prev[comment._id] }))}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--color6)',
                    }}
                  >
                    Reply{comment.repliesCount > 0 ? ` (${comment.repliesCount})` : ''}
                  </button>
                  <span style={{ fontSize: 12, color: 'var(--color7)' }}>
                    {timeAgo(comment.createdAt)}
                  </span>
                </div>

                
              </div>
            </div>
          );
        })}
      </div>
      {likesFor && (
        <LikesModal targetType="comments" targetId={likesFor} onClose={() => setLikesFor(null)} />
      )}
    </div>
  );
}
