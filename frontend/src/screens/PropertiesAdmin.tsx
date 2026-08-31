import { useState, type FormEvent } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { LIST_PROPERTIES, CREATE_PROPERTY } from '../graphql/operations';

export function PropertiesAdmin() {
  const { data, loading, error } = useQuery(LIST_PROPERTIES);
  const [createProperty, { loading: creating }] = useMutation(CREATE_PROPERTY, {
    refetchQueries: [{ query: LIST_PROPERTIES }],
  });

  const [address, setAddress] = useState('');
  const [strataPlanNumber, setStrataPlanNumber] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!address.trim() || !strataPlanNumber.trim()) return;
    await createProperty({ variables: { address, strataPlanNumber } });
    setAddress('');
    setStrataPlanNumber('');
  }

  return (
    <div className="stack">
      <section className="card">
        <h2>Add a property</h2>
        <form onSubmit={onSubmit} className="form">
          <label>
            Address
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12 Ocean Dr, Scarborough WA"
            />
          </label>
          <label>
            Strata plan number
            <input
              value={strataPlanNumber}
              onChange={(e) => setStrataPlanNumber(e.target.value)}
              placeholder="SP12345"
            />
          </label>
          <button type="submit" disabled={creating}>
            {creating ? 'Adding…' : 'Add property'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Properties</h2>
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="error">{error.message}</p>}
        {data && data.listProperties.length === 0 && (
          <p className="muted">No properties yet — add one above.</p>
        )}
        <ul className="list">
          {data?.listProperties.map((p) => (
            <li key={p.id}>
              <strong>{p.address}</strong>
              <span className="tag">{p.strataPlanNumber}</span>
              <div className="muted small">{p.id}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
