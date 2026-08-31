import { useState, type FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { LIST_PROPERTIES, SUBMIT_TICKET } from '../graphql/operations';

export function ResidentSubmit() {
  const { data, loading: loadingProps } = useQuery(LIST_PROPERTIES);
  const [submitTicket, { loading: submitting }] = useMutation(SUBMIT_TICKET);

  const [propertyId, setPropertyId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [lastRef, setLastRef] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!propertyId || !title.trim() || !description.trim() || !submittedBy.trim()) {
      return;
    }
    const res = await submitTicket({
      variables: { propertyId, title, description, submittedBy },
    });
    setLastRef(res.data?.submitTicket.id ?? null);
    setTitle('');
    setDescription('');
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Submit a query / ticket</h2>
        <form onSubmit={onSubmit} className="form">
          <label>
            Property
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              disabled={loadingProps}
            >
              <option value="">Select a property…</option>
              {data?.listProperties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address} ({p.strataPlanNumber})
                </option>
              ))}
            </select>
          </label>
          <label>
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Leaking tap in lobby"
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue…"
            />
          </label>
          <label>
            Your email
            <input
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              placeholder="resident@example.com"
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit ticket'}
          </button>
        </form>
        {lastRef && (
          <p className="success">
            Ticket submitted ✅ — reference <code>{lastRef}</code>
          </p>
        )}
      </section>
    </div>
  );
}
