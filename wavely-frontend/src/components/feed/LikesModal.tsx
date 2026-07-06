'use client';

import { axiosPrivate } from '@/lib/axios';
import { IUser } from '@/types';
import { useEffect, useState } from 'react';
import Avatar from '../shared/Avatar';
import Spinner from '../shared/Spinner';

interface Props {
  targetType: 'posts' | 'comments' | 'replies';
  targetId: string;
  onClose: () => void;
}

// modal listing everyone who liked a post, comment or reply
export default function LikesModal({ targetType, targetId, onClose }: Props) {
  const [users, setUsers] = useState<IUser[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    axiosPrivate
      .get(`/${targetType}/${targetId}/likes`, { signal: controller.signal })
      .then((res) => {
        setUsers(res.data.data?.users ?? []);
        setNextCursor(res.data.data?.nextCursor ?? null);
      })
      .catch((err) => {
        if (err.name !== 'CanceledError') setError('Failed to load likes');
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, [targetType, targetId]);

  const loadMore = async () => {
    if (!nextCursor || isLoading) return;
    setIsLoading(true);
    try {
      const res = await axiosPrivate.get(
        `/${targetType}/${targetId}/likes?cursor=${nextCursor}`,
      );
      setUsers((prev) => [...prev, ...(res.data.data?.users ?? [])]);
      setNextCursor(res.data.data?.nextCursor ?? null);
    } catch {
      setError('Failed to load more');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
      role="dialog"
    >
      <div
        className="modal-dialog modal-dialog-centered modal-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content _b_radious6">
          <div className="modal-header py-2">
            <h6 className="modal-title">Liked by</h6>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className="modal-body py-2" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {isLoading && <Spinner small />}
            {error && <p className="text-danger small mb-0">{error}</p>}
            {!isLoading && !error && users.length === 0 && (
              <p className="small mb-0" style={{ color: '#666' }}>
                No likes yet.
              </p>
            )}
            {users.map((u, i) => (
              <div key={`${u._id}-${i}`} className="d-flex align-items-center gap-2 py-1">
                <Avatar src={u.avatar} name={u.firstName} size={32} />
                <span style={{ fontSize: 14 }}>
                  {u.firstName} {u.lastName}
                </span>
              </div>
            ))}
            {nextCursor && !isLoading && (
              <button
                type="button"
                className="btn btn-link btn-sm w-100"
                onClick={loadMore}
              >
                Load more
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
