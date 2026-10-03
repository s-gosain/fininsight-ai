import React, { useState } from 'react';
import { 
  Users, 
  X, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Send, 
  Reply, 
  Filter,
  Shield,
  Plus
} from 'lucide-react';
import { TeamComment, UserRole } from '../types';
import { USER_ROLES } from '../utils/encryption';

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  comments: TeamComment[];
  userRole: UserRole;
  userName: string;
  onAddComment: (lineKey: string, text: string) => void;
  onReplyComment: (commentId: string, text: string) => void;
  onUpdateStatus: (commentId: string, status: TeamComment['status']) => void;
  selectedLineKey?: string | null;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  isOpen,
  onClose,
  comments,
  userRole,
  userName,
  onAddComment,
  onReplyComment,
  onUpdateStatus,
  selectedLineKey,
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'Under Review' | 'Resolved'>('All');
  const [newCommentText, setNewCommentText] = useState('');
  const [targetLine, setTargetLine] = useState(selectedLineKey || 'operatingExpenses');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  if (!isOpen) return null;

  const roleConfig = USER_ROLES[userRole];

  const filteredComments = comments.filter((c) => {
    if (filterStatus === 'All') return true;
    return c.status === filterStatus;
  });

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(targetLine, newCommentText);
    setNewCommentText('');
  };

  const handleSendReply = (commentId: string) => {
    if (!replyText.trim()) return;
    onReplyComment(commentId, replyText);
    setReplyText('');
    setReplyingToId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="relative z-10 w-full sm:w-[480px] max-w-full bg-[#09090b] border-l border-[#27272a] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Team Collaboration & Annotations
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/30">
                  {comments.length} Notes
                </span>
              </h3>
              <p className="text-[11px] text-[#71717a] font-mono truncate max-w-[220px] sm:max-w-none">Acting as: <span className="text-[#fafafa] font-medium">{userName} ({roleConfig.displayName.split(' ')[0]})</span></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#71717a] hover:text-white hover:bg-[#27272a] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      {/* Filter Tabs */}
      <div className="p-2.5 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between text-xs">
        <span className="text-[#71717a] font-medium ml-1">Status:</span>
        <div className="flex items-center gap-1">
          {(['All', 'Open', 'Under Review', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filterStatus === st
                  ? 'bg-[#27272a] text-white border border-[#3f3f46] shadow-sm'
                  : 'text-[#a1a1aa] hover:text-white hover:bg-[#27272a]/50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {filteredComments.map((comment) => (
          <div
            key={comment.id}
            className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-3 shadow-sm hover:border-[#3f3f46] transition-all"
          >
            {/* Header: Author & Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center text-[10px]">
                  {comment.avatar}
                </div>
                <div>
                  <span className="font-semibold text-white">{comment.author}</span>
                  <span className="text-[10px] text-[#71717a] ml-1.5 font-mono">({comment.role})</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-1">
                <select
                  value={comment.status}
                  disabled={!roleConfig.canResolveComments}
                  onChange={(e) => onUpdateStatus(comment.id, e.target.value as any)}
                  className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${
                    comment.status === 'Resolved'
                      ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30'
                      : comment.status === 'Under Review'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  <option value="Open" className="bg-[#09090b] text-[#fafafa]">Open</option>
                  <option value="Under Review" className="bg-[#09090b] text-[#fafafa]">Under Review</option>
                  <option value="Resolved" className="bg-[#09090b] text-[#fafafa]">Resolved</option>
                </select>
              </div>
            </div>

            {/* Line Item Tag */}
            <div className="inline-block px-2 py-0.5 rounded bg-[#09090b] text-[10px] text-indigo-400 border border-[#27272a] font-mono">
              Line: {comment.lineItemKey}
            </div>

            {/* Comment Text */}
            <p className="text-[#a1a1aa] leading-relaxed">{comment.text}</p>

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="pl-3 border-l-2 border-[#27272a] space-y-2 mt-2">
                {comment.replies.map((rep) => (
                  <div key={rep.id} className="bg-[#09090b] p-2.5 rounded-lg border border-[#27272a] text-[11px]">
                    <div className="flex items-center justify-between text-[#71717a] mb-0.5">
                      <span className="font-medium text-white">{rep.author} <span className="text-[10px] text-[#71717a] font-mono">({rep.role})</span></span>
                      <span className="text-[9px] font-mono">{new Date(rep.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[#a1a1aa]">{rep.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply trigger & Footer */}
            <div className="flex items-center justify-between pt-1 text-[10px] text-[#71717a] font-mono">
              <span>{new Date(comment.timestamp).toLocaleDateString()} at {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              
              {roleConfig.canAddComments && (
                <button
                  onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              )}
            </div>

            {/* Inline reply composer */}
            {replyingToId === comment.id && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleSendReply(comment.id)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs cursor-pointer"
                >
                  Send
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

      {/* New Comment Composer */}
      {roleConfig.canAddComments && (
        <div className="p-3 border-t border-[#27272a] bg-[#18181b]">
          <form onSubmit={handleCreateComment} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#71717a]">
              <span>Annotate Statement Line:</span>
              <select
                value={targetLine}
                onChange={(e) => setTargetLine(e.target.value)}
                className="bg-[#09090b] border border-[#27272a] rounded px-2 py-0.5 text-xs text-[#fafafa] focus:outline-none"
              >
                <option value="operatingExpenses">Operating Expenses</option>
                <option value="longTermDebt">Long Term Debt</option>
                <option value="revenue">Total Revenue</option>
                <option value="grossProfit">Gross Profit</option>
                <option value="capitalExpenditures">Capital Expenditures</option>
                <option value="accountsReceivable">Accounts Receivable</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add team insight, audit note, or explanation..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#09090b] border border-[#27272a] text-xs text-white placeholder-[#71717a] focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      </div>
    </div>
  );
};
