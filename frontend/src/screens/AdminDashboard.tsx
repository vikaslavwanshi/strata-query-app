import { useState, type FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  LIST_TICKETS,
  RESPOND_TO_TICKET,
  UPDATE_TICKET_STATUS,
} from '../graphql/operations';
import type { ListTicketsQuery, TicketStatus } from '../gql/graphql';

type Ticket = ListTicketsQuery['listTickets'][number];
type StatusFilter = 'ALL' | TicketStatus;

const STATUSES: TicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

export function AdminDashboard() {
  const [filter, setFilter] = useState<StatusFilter>('ALL');

  const { data, loading, error, refetch } = useQuery(LIST_TICKETS, {
    variables: filter === 'ALL' ? {} : { status: filter },
    fetchPolicy: 'cache-and-network',
  });

  return (
    <div className="stack">
      <section className="card">
        <div className="row spread">
          <h2>Tickets</h2>
          <label className="inline">
            Filter
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as StatusFilter)}
            >
              <option value="ALL">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error.message}</p>}
        {data && data.listTickets.length === 0 && (
          <p className="muted">No tickets match this filter.</p>
        )}

        <div className="stack">
          {data?.listTickets.map((t) => (
            <TicketCard key={t.id} ticket={t} onChanged={() => refetch()} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TicketCard({ ticket, onChanged }: { ticket: Ticket; onChanged: () => void }) {
  const [response, setResponse] = useState('');
  const [respondedBy, setRespondedBy] = useState('');

  const [respondToTicket, { loading: responding }] = useMutation(RESPOND_TO_TICKET);
  const [updateTicketStatus, { loading: updating }] =
    useMutation(UPDATE_TICKET_STATUS);

  async function onRespond(e: FormEvent) {
    e.preventDefault();
    if (!response.trim() || !respondedBy.trim()) return;
    await respondToTicket({ variables: { id: ticket.id, response, respondedBy } });
    setResponse('');
    onChanged();
  }

  async function onStatusChange(status: TicketStatus) {
    await updateTicketStatus({ variables: { id: ticket.id, status } });
    onChanged();
  }

  return (
    <div className="ticket">
      <div className="row spread">
        <strong>{ticket.title}</strong>
        <span className={`badge badge-${ticket.status}`}>{ticket.status}</span>
      </div>
      <p className="muted small">
        from {ticket.submittedBy} · {new Date(ticket.createdAt).toLocaleString()}
      </p>
      <p>{ticket.description}</p>

      {ticket.response && (
        <div className="response">
          <div className="muted small">
            Response by {ticket.respondedBy}
            {ticket.respondedAt &&
              ` · ${new Date(ticket.respondedAt).toLocaleString()}`}
          </div>
          <p>{ticket.response}</p>
        </div>
      )}

      <form onSubmit={onRespond} className="form">
        <label>
          Respond
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={2}
            placeholder="Type a response…"
          />
        </label>
        <label>
          Your email
          <input
            value={respondedBy}
            onChange={(e) => setRespondedBy(e.target.value)}
            placeholder="admin@strata.com"
          />
        </label>
        <div className="row">
          <button type="submit" disabled={responding}>
            {responding ? 'Sending…' : 'Send response'}
          </button>
          <label className="inline">
            Status
            <select
              value={ticket.status}
              onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
              disabled={updating}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>
    </div>
  );
}
