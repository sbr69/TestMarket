import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function OAuthConsentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, sessionResolved, setAuthModalOpen } = useAuthStore();

  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const responseType = searchParams.get('response_type');
  const state = searchParams.get('state');
  const scope = searchParams.get('scope') || '';
  const codeChallenge = searchParams.get('code_challenge') || '';
  const codeChallengeMethod = searchParams.get('code_challenge_method') || '';

  const [clientInfo, setClientInfo] = useState<{ name: string; redirect_uris: string; allowed_scopes: string[] } | null>(null);
  const [error, setError] = useState('');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  useEffect(() => {
    if (!clientId || !redirectUri || responseType !== 'code') {
      setError('Invalid OAuth parameters.');
      return;
    }

    if (!sessionResolved) return;

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Fetch client info
    fetch(`/api/oauth/client?client_id=${clientId}`)
      .then(res => {
        if (!res.ok) throw new Error('Client not found');
        return res.json();
      })
      .then(data => {
        const allowedUris = data.redirect_uris.split(',').map((uri: string) => uri.trim());
        if (!allowedUris.includes(redirectUri)) {
          throw new Error('Invalid redirect URI');
        }
        setClientInfo(data);
      })
      .catch(err => {
        setError(err.message);
      });
  }, [clientId, redirectUri, responseType, user, sessionResolved]);

  const handleAuthorize = async () => {
    if (!clientId || !redirectUri || responseType !== 'code') {
      setError('Invalid OAuth parameters.');
      return;
    }
    setIsAuthorizing(true);
    try {
      const res = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: responseType,
          scope,
          ...(codeChallenge ? { code_challenge: codeChallenge, code_challenge_method: codeChallengeMethod || 'S256' } : {})
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to authorize');
      }

      // Redirect back to the client with the code and state
      const url = new URL(redirectUri);
      url.searchParams.set('code', data.code);
      if (state) url.searchParams.set('state', state);
      window.location.href = url.toString();

    } catch (err: any) {
      setError(err.message);
      setIsAuthorizing(false);
    }
  };

  const handleDeny = () => {
    if (!redirectUri) {
      setError('Invalid OAuth parameters.');
      return;
    }
    const url = new URL(redirectUri);
    url.searchParams.set('error', 'access_denied');
    if (state) url.searchParams.set('state', state);
    window.location.href = url.toString();
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Authorization Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!clientInfo || !user) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 text-center">
        <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading authorization details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#1B1F5E] p-6 text-center">
        <h1 className="text-2xl font-bold text-white tracking-tight">Connect with TestMarket</h1>
      </div>
      <div className="p-8">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-xl text-gray-700 shadow-inner">
            {clientInfo.name.substring(0, 1)}
          </div>
          <div className="flex space-x-1 text-gray-400">
            <span>•</span><span>•</span><span>•</span>
          </div>
          <div className="w-16 h-16 bg-[#F97316] rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-inner">
            TM
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          {clientInfo.name} wants to access your account
        </h2>
        <p className="text-center text-gray-600 text-sm mb-8">
          Signed in as <span className="font-bold text-gray-900">{user.email}</span>
        </p>
        <p className="text-center text-gray-500 text-xs mb-6 break-all">
          Access will return to <span className="font-semibold text-gray-700">{new URL(redirectUri || window.location.origin).origin}</span>
        </p>

        <div className="space-y-4 mb-8 border-t border-b border-gray-100 py-4">
          {(scope ? scope.split(/\s+/) : clientInfo.allowed_scopes).map((requestedScope) => (
            <div className="flex items-start" key={requestedScope}>
              <span className="text-green-500 mr-3 mt-0.5">✓</span>
              <p className="text-sm text-gray-700">{requestedScope === 'profile' ? 'View your account profile and email address.' : requestedScope === 'cart:read' ? 'View your shopping cart.' : requestedScope === 'cart:write' ? 'Manage your shopping cart.' : requestedScope === 'checkout:prepare' ? 'Prepare a checkout on your behalf.' : requestedScope === 'checkout:confirm' ? 'Confirm a checkout after payment.' : requestedScope === 'orders:read' ? 'View your order history.' : requestedScope}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAuthorize}
            disabled={isAuthorizing}
            className="w-full py-3 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors disabled:opacity-50"
          >
            {isAuthorizing ? 'Authorizing...' : 'Allow Access'}
          </button>
          <button
            onClick={handleDeny}
            disabled={isAuthorizing}
            className="w-full py-3 bg-white text-gray-700 font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
