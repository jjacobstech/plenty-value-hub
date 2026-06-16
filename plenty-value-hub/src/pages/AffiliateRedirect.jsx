/**
 * AffiliateRedirect — Handles /ref/:link_code visits.
 * Tracks the click via backend, stores the link code in sessionStorage,
 * then redirects the visitor to the product page.
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2 } from 'lucide-react';

export default function AffiliateRedirect() {
  const { link_code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!link_code) {
      navigate('/marketplace', { replace: true });
      return;
    }

    base44.functions.invoke('trackAffiliateClick', { link_code })
      .then(res => {
        const { product_id } = res.data || {};
        if (product_id) {
          // Store affiliate code so purchase flow can attribute it
          sessionStorage.setItem('pv_ref', link_code);
          navigate(`/product/${product_id}`, { replace: true });
        } else {
          navigate('/marketplace', { replace: true });
        }
      })
      .catch(() => {
        // Silently redirect even on error — don't block the user
        navigate('/marketplace', { replace: true });
      });
  }, [link_code]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#81C14B' }} />
      <p className="text-sm text-muted-foreground">Redirecting you to the product…</p>
    </div>
  );
}