import React, { useState } from 'react';
import { WalletTransaction, PaymentMethod, Currency } from '../types';
import { PAYMENT_ACCOUNTS_INFO, EXCHANGE_RATE_VES } from '../data/mockData';
import { CreditCard, Wallet, ArrowDownRight, ArrowUpRight, Copy, Check, ShieldCheck, Clock, FileCheck, Upload, AlertCircle, PlusCircle, ExternalLink } from 'lucide-react';

interface WalletViewProps {
  balanceUsd: number;
  transactions: WalletTransaction[];
  onAddTransaction: (tx: WalletTransaction) => void;
  currency: Currency;
}

export const WalletView: React.FC<WalletViewProps> = ({
  balanceUsd,
  transactions,
  onAddTransaction,
  currency,
}) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'recharge' | 'verification'>('balance');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pago_movil');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Verification Form State
  const [verifMethod, setVerifMethod] = useState<PaymentMethod>('pago_movil');
  const [verifRef, setVerifRef] = useState('');
  const [verifAmount, setVerifAmount] = useState('');
  const [verifBank, setVerifBank] = useState('Banco de Venezuela');
  const [isSubmittingVerif, setIsSubmittingVerif] = useState(false);
  const [verifSuccessMsg, setVerifSuccessMsg] = useState(false);

  const balanceVes = balanceUsd * EXCHANGE_RATE_VES;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifRef || !verifAmount) return;

    setIsSubmittingVerif(true);

    setTimeout(() => {
      const amountUsdVal = verifMethod === 'pago_movil' 
        ? parseFloat(verifAmount) / EXCHANGE_RATE_VES 
        : parseFloat(verifAmount);
      
      const newTx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        type: 'recharge',
        method: verifMethod,
        amountUsd: amountUsdVal,
        amountVes: amountUsdVal * EXCHANGE_RATE_VES,
        reference: verifRef,
        bankName: verifMethod === 'pago_movil' ? verifBank : undefined,
        status: 'approved',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        description: `Recarga aprobada vía ${verifMethod.replace('_', ' ')}`,
      };

      onAddTransaction(newTx);
      setIsSubmittingVerif(false);
      setVerifSuccessMsg(true);
      setVerifRef('');
      setVerifAmount('');
      setTimeout(() => setVerifSuccessMsg(false), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto pb-20">
      
      {/* WALLET DUAL BALANCE CARD - BENTO BLACK & PURPLE */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-2xl border border-purple-900/50 space-y-4 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-600/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-purple-600/30 text-purple-300 rounded-xl flex items-center justify-center font-bold border border-purple-500/40">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 block">Billetera Vixy</span>
              <span className="text-xs font-semibold text-slate-200">Saldo Recargado</span>
            </div>
          </div>
          <span className="bg-purple-600/20 text-purple-300 text-[10px] px-2.5 py-1 rounded-full font-bold border border-purple-500/30">
            Multimoneda 🇻🇪 🇺🇸
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-900/40">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dólares ($ USD)</span>
            <span className="text-2xl font-mono font-black text-purple-300">
              ${balanceUsd.toFixed(2)}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Bolívares (Bs. VES)</span>
            <span className="text-xl font-mono font-bold text-slate-100">
              {balanceVes.toFixed(2)} <span className="text-xs text-slate-400 font-sans">Bs.</span>
            </span>
          </div>
        </div>

        {/* Quick Tabs: Saldo, Datos Recarga, Verificación */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-2xl border border-purple-900/50 text-xs font-bold pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`py-2 rounded-xl transition ${
              activeTab === 'balance' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Historial
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recharge')}
            className={`py-2 rounded-xl transition ${
              activeTab === 'recharge' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Datos Cuentas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`py-2 rounded-xl transition ${
              activeTab === 'verification' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Verificar Pago
          </button>
        </div>
      </div>

      {/* TAB 1: RECHARGE ACCOUNTS DATA */}
      {activeTab === 'recharge' && (
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-purple-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-purple-600" />
              Cuentas Vixy para Recargar Saldo
            </h3>
            <span className="text-[10px] text-purple-700 font-mono font-bold">1 USD = {EXCHANGE_RATE_VES.toFixed(2)} Bs.</span>
          </div>

          {/* Payment Method Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'pago_movil', label: 'Pago Móvil', icon: '⚡' },
              { id: 'zinli', label: 'Zinli', icon: '📱' },
              { id: 'binance', label: 'Binance Pay', icon: '🟡' },
              { id: 'paypal', label: 'PayPal', icon: '🟦' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                className={`p-2.5 rounded-2xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
                  selectedMethod === m.id
                    ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50'
                }`}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* PAGO MÓVIL DETAILS */}
          {selectedMethod === 'pago_movil' && (
            <div className="bg-slate-50 border border-purple-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <span className="text-xs font-extrabold text-slate-900">Pago Móvil Bolívares (VES)</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">Automático 24/7</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">BANCO RECEPTOR</span>
                    <strong className="text-slate-800">{PAYMENT_ACCOUNTS_INFO.pagoMovil.banco}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">RIF / CÉDULA</span>
                    <strong className="text-slate-800 font-mono">{PAYMENT_ACCOUNTS_INFO.pagoMovil.cedula}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard('J501239884', 'rif')}
                    className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedField === 'rif' ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'rif' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">NÚMERO DE TELÉFONO</span>
                    <strong className="text-slate-800 font-mono">{PAYMENT_ACCOUNTS_INFO.pagoMovil.telefono}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard('04125550000', 'phone')}
                    className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-purple-700" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedField === 'phone' ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                💡 {PAYMENT_ACCOUNTS_INFO.pagoMovil.instrucciones}
              </p>

              <button
                type="button"
                onClick={() => {
                  setVerifMethod('pago_movil');
                  setActiveTab('verification');
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
              >
                <span>VERIFICAR REFERENCIA PAGO MÓVIL</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ZINLI DETAILS */}
          {selectedMethod === 'zinli' && (
            <div className="bg-purple-50/60 border border-purple-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <span className="text-xs font-extrabold text-purple-900">Zinli Wallet (USD)</span>
                <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full">Sin Comisión</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-purple-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">CORREO REGISTRADO ZINLI</span>
                  <strong className="text-purple-900 font-mono text-xs">{PAYMENT_ACCOUNTS_INFO.zinli.email}</strong>
                </div>
                <button
                  onClick={() => copyToClipboard(PAYMENT_ACCOUNTS_INFO.zinli.email, 'zinli')}
                  className="p-1.5 bg-purple-100 text-purple-900 rounded-lg text-[10px] font-bold"
                >
                  {copiedField === 'zinli' ? 'Copiado' : 'Copiar Email'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVerifMethod('zinli');
                  setActiveTab('verification');
                }}
                className="w-full bg-purple-900 text-white font-extrabold py-2.5 rounded-xl text-xs"
              >
                REGISTRAR VERIFICACIÓN ZINLI
              </button>
            </div>
          )}

          {/* BINANCE DETAILS */}
          {selectedMethod === 'binance' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <span className="text-xs font-extrabold text-slate-900">Binance Pay (USDT)</span>
                <span className="text-[10px] bg-amber-200 text-slate-900 font-bold px-2 py-0.5 rounded-full">Instantáneo</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">BINANCE PAY ID</span>
                  <strong className="text-slate-900 font-mono text-xs">{PAYMENT_ACCOUNTS_INFO.binance.payId}</strong>
                </div>
                <button
                  onClick={() => copyToClipboard('284910382', 'binance')}
                  className="p-1.5 bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold"
                >
                  {copiedField === 'binance' ? 'Copiado' : 'Copiar Pay ID'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVerifMethod('binance');
                  setActiveTab('verification');
                }}
                className="w-full bg-slate-900 text-amber-400 font-extrabold py-2.5 rounded-xl text-xs"
              >
                REGISTRAR VERIFICACIÓN BINANCE
              </button>
            </div>
          )}

          {/* PAYPAL DETAILS */}
          {selectedMethod === 'paypal' && (
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <span className="text-xs font-extrabold text-blue-900">PayPal International</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">CORREO PAYPAL</span>
                  <strong className="text-blue-900 font-mono text-xs">{PAYMENT_ACCOUNTS_INFO.paypal.email}</strong>
                </div>
                <button
                  onClick={() => copyToClipboard(PAYMENT_ACCOUNTS_INFO.paypal.email, 'paypal')}
                  className="p-1.5 bg-blue-100 text-blue-900 rounded-lg text-[10px] font-bold"
                >
                  {copiedField === 'paypal' ? 'Copiado' : 'Copiar Email'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVerifMethod('paypal');
                  setActiveTab('verification');
                }}
                className="w-full bg-blue-900 text-white font-extrabold py-2.5 rounded-xl text-xs"
              >
                REGISTRAR VERIFICACIÓN PAYPAL
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT VERIFICATION MENU (Formulario de Verificación de Pago) */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-purple-100 space-y-4">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-3">
            <FileCheck className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Menú de Verificación de Pagos</h3>
              <p className="text-[11px] text-slate-500">Ingresa la referencia con la que realizaste el pago</p>
            </div>
          </div>

          {verifSuccessMsg && (
            <div className="bg-purple-50 border border-purple-300 text-purple-900 p-3 rounded-2xl text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-5 h-5 text-purple-600 shrink-0" />
              <span>¡Pago verificado y aprobado! Tu saldo ha sido actualizado de inmediato en Vixy.</span>
            </div>
          )}

          <form onSubmit={handleSubmitVerification} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Método con el que pagaste:
              </label>
              <select
                value={verifMethod}
                onChange={(e) => setVerifMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="pago_movil">⚡ Pago Móvil (Bolívares VES)</option>
                <option value="zinli">📱 Zinli Wallet (USD)</option>
                <option value="binance">🟡 Binance Pay (USDT)</option>
                <option value="paypal">🟦 PayPal (USD)</option>
                <option value="direct_driver">💵 Pago directo al conductor</option>
              </select>
            </div>

            {verifMethod === 'pago_movil' && (
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Banco emisor:</label>
                <select
                  value={verifBank}
                  onChange={(e) => setVerifBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Banco de Venezuela">Banco de Venezuela (0102)</option>
                  <option value="Banesco">Banesco (0134)</option>
                  <option value="Mercantil">Mercantil (0105)</option>
                  <option value="BBVA Provincial">BBVA Provincial (0108)</option>
                  <option value="BNC">BNC Banco Nacional de Crédito (0191)</option>
                  <option value="Bancaribe">Bancaribe (0114)</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {verifMethod === 'pago_movil' ? 'Monto pagado en Bolívares (Bs.):' : 'Monto pagado en USD ($):'}
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={verifAmount}
                onChange={(e) => setVerifAmount(e.target.value)}
                placeholder={verifMethod === 'pago_movil' ? 'Ej: 975.00' : 'Ej: 15.00'}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Número de Referencia o ID de Transacción:
              </label>
              <input
                type="text"
                required
                value={verifRef}
                onChange={(e) => setVerifRef(e.target.value)}
                placeholder="Ej: 982341 ó ZN-881923"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Simulated Receipt Upload */}
            <div className="border-2 border-dashed border-purple-200 hover:border-purple-500 bg-purple-50/40 p-3 rounded-2xl text-center cursor-pointer transition">
              <Upload className="w-5 h-5 text-purple-500 mx-auto mb-1" />
              <span className="text-[11px] font-bold text-slate-700 block">Adjuntar capture o recibo (Opcional)</span>
              <span className="text-[10px] text-slate-400">PNG, JPG de tu transferencia</span>
            </div>

            <button
              type="submit"
              disabled={isSubmittingVerif}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 rounded-2xl text-xs uppercase shadow-lg shadow-purple-900/30 transition active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmittingVerif ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verificando pago con el banco...</span>
                </>
              ) : (
                <span>ENVIAR PAGO PARA VERIFICAR EN VIXY</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY LIST */}
      {activeTab === 'balance' && (
        <div className="bg-white rounded-3xl p-5 shadow-xl border border-purple-100 space-y-3">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-purple-100 pb-2">
            Movimientos de Billetera Vixy
          </h3>

          <div className="divide-y divide-purple-50 space-y-2">
            {transactions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No hay transacciones registradas.</p>
            ) : (
              transactions.map((tx) => {
                const isRecharge = tx.type === 'recharge';
                return (
                  <div key={tx.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isRecharge ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isRecharge ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 leading-tight">{tx.description}</h4>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          Ref: {tx.reference || 'N/A'} • {tx.date}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`font-mono font-extrabold block ${
                        isRecharge ? 'text-purple-600' : 'text-slate-800'
                      }`}>
                        {isRecharge ? '+' : '-'}${tx.amountUsd.toFixed(2)} USD
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tx.amountVes.toFixed(2)} Bs.
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
