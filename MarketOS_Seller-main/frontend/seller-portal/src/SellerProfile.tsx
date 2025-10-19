import { useEffect, useState } from 'react';
import { getMySeller, createSeller, updateSeller, type Seller } from './api/sellers';
import { saveSeller } from './lib/seller-bus';

export default function SellerProfile() {
  const [me, setMe] = useState<Seller | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setError(null); setOk(null);
      try {
        const s = await getMySeller();
        setMe(s);
        if (s) { setName(s.businessName || ''); setEmail(s.email || ''); setPhone(s.phone || ''); }
      } catch (e: any) {
        console.warn('load seller failed', e);
        setError('Failed to load seller');
      }
    })();
  }, []);

  const canCreate = !me && name.trim().length > 0 && !busy;
  const canUpdate = !!me && !busy &&
    (name.trim() !== (me.businessName||'') || email !== (me.email||'') || phone !== (me.phone||''));

  async function onCreate() {
    setBusy(true); setError(null); setOk(null);
    try {
      const payload = {
        businessName: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        sellerType: 'online' as const,
      };
      const created = await createSeller(payload);
      setMe(created);
saveSeller(created);
      setOk(`Seller created: ${created.sellerId}`);
    } catch (e: any) {
      console.error(e);
      setError(String(e?.message || 'Create failed'));
    } finally { setBusy(false); }
  }

  async function onUpdate() {
    if (!me) return;
    setBusy(true); setError(null); setOk(null);
    try {
      const patch = { businessName: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined };
      const updated = await updateSeller(me.sellerId, patch);
      setMe(updated);
saveSeller(updated);
      setOk('Saved');
    } catch (e: any) {
      console.error(e);
      setError(String(e?.message || 'Update failed'));
    } finally { setBusy(false); }
  }

  return (
    <div className="p-6 space-y-3">
      <h2 className="text-xl font-bold mb-3">Seller Profile</h2>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {ok && <div className="text-green-700 text-sm">{ok}</div>}

      <div className="space-y-2">
        <div>
          <label className="block text-sm">Name</label>
          <input className="border rounded px-2 py-1" value={name} onChange={e=>setName(e.target.value)} placeholder="Your brand name" />
        </div>
        <div>
          <label className="block text-sm">Contact Email</label>
          <input className="border rounded px-2 py-1" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@brand.com" />
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input className="border rounded px-2 py-1" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+91-XXXX-XXXXXX" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button disabled={!canCreate} onClick={onCreate} className="border rounded px-3 py-1 disabled:opacity-50">
          Create Seller
        </button>
        <button disabled={!canUpdate} onClick={onUpdate} className="border rounded px-3 py-1 disabled:opacity-50">
          Save Changes
        </button>
        <span className="text-xs text-gray-600">Status: {me ? `existing (${me.sellerId})` : 'not found'}</span>
      </div>
    </div>
  );
}
