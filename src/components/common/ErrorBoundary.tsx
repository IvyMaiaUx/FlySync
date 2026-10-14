import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FlySync ErrorBoundary capturou um erro:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 m-4 rounded-2xl bg-[#1A0835] border border-rose-500/50 text-white max-w-lg mx-auto shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {this.props.fallbackTitle || 'Ops, ocorreu um imprevisto nesta seção'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {this.state.error?.message || 'Erro inesperado na renderização.'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#22C55E] text-slate-950 hover:bg-emerald-400 transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Recarregar aplicativo</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
