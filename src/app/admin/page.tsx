'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import { ToastProvider, useToast } from '@/components/ui/toast';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Settings,
  Calendar,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  Copy,
  Download
} from 'lucide-react';
import type { TipItem } from '@/lib/types';

// Simple password - in production, use proper authentication
const ADMIN_PASSWORD = 'probabl2025';

interface PendingTip {
  id: string;
  tipId: string;
  date: string;
  file: string;
  betType: 'single' | 'accumulator';
  risk: 'safe' | 'medium' | 'high';
  sport?: string;
  event: string;
  selection: string;
  odds: number;
}

function AdminPageContent() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Upload section
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [jsonText, setJsonText] = useState<string>('');
  
  // Results management
  const [pendingTips, setPendingTips] = useState<PendingTip[]>([]);
  const [selectedResults, setSelectedResults] = useState<Record<string, 'win' | 'loss' | 'void'>>({});
  const [updatingResults, setUpdatingResults] = useState<Set<string>>(new Set());
  
  // Tips management (all tips)
  const [allTips, setAllTips] = useState<(PendingTip & { result: string })[]>([]);
  const [deletingTips, setDeletingTips] = useState<Set<string>>(new Set());

  // JSON Template for copy/download (with current valid dates)
  const getCurrentValidDates = () => {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    
    return {
      today: now.toISOString().split('T')[0],
      tomorrowAt15: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0, 0).toISOString(),
      dayAfterAt17: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 17, 30, 0).toISOString(),
      dayAfterAt20: new Date(dayAfterTomorrow.getFullYear(), dayAfterTomorrow.getMonth(), dayAfterTomorrow.getDate(), 20, 0, 0).toISOString(),
    };
  };

  const validDates = getCurrentValidDates();
  const jsonTemplate = {
    "version": 2,
    "dateISO": validDates.today,
    "generatedAt": new Date().toISOString(),
    "generatedBy": "manual",
    "tips": [
      {
        "id": "tip-001",
        "betType": "single",
        "risk": "safe",
        "rationale": "Arsenal has excellent home record with 80% win rate at Emirates this season.",
        "result": "pending",
        "legs": [
          {
            "sport": "Football",
            "league": "Premier League",
            "event": {
              "name": "Arsenal vs Liverpool",
              "home": "Arsenal",
              "away": "Liverpool",
              "scheduledAt": validDates.tomorrowAt15,
              "timezone": "Europe/London"
            },
            "market": "Match Result",
            "selection": "Arsenal Win",
            "avgOdds": 2.50,
            "bookmakers": [
              { "name": "Bet365", "odds": 2.45, "url": "https://www.bet365.com" },
              { "name": "Betfair", "odds": 2.55, "url": "https://www.betfair.com" }
            ]
          }
        ]
      }
    ],
    "seo": {
      "title": `Daily Betting Tips for ${validDates.today}`,
      "description": "Expert betting tips with detailed analysis for today's matches"
    }
  };

  // Copy JSON template to clipboard
  const copyJsonTemplate = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(jsonTemplate, null, 2));
      showToast('Template JSON copiado para a clipboard!', 'success');
    } catch (error) {
      showToast('Erro ao copiar template JSON', 'error');
      console.error('Failed to copy:', error);
    }
  };

  // Download JSON template as file
  const downloadJsonTemplate = () => {
    const blob = new Blob([JSON.stringify(jsonTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tips-template-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Template JSON descarregado!', 'success');
  };

  // Helper functions for text mode
  const fillTemplateInTextArea = () => {
    setJsonText(JSON.stringify(jsonTemplate, null, 2));
    showToast('📋 Template preenchido na área de texto', 'success');
  };

  const clearTextArea = () => {
    setJsonText('');
    setUploadResult(null);
    setUploadError(null);
  };

  const formatJsonInTextArea = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      showToast('✨ JSON formatado com sucesso', 'success');
    } catch {
      showToast('❌ JSON inválido - não foi possível formatar', 'error');
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load pending tips and all tips when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPendingTips();
      loadAllTips();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_authenticated', 'true');
      setPassword('');
      showToast('✅ Autenticação realizada com sucesso!', 'success');
    } else {
      showToast('❌ Password incorreta!', 'error');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
    setUploadFile(null);
    setUploadResult(null);
    setUploadError(null);
    setJsonText('');
    setPendingTips([]);
    setAllTips([]);
    setSelectedResults({});
    setUpdatingResults(new Set());
    setDeletingTips(new Set());
  };

  const loadPendingTips = async () => {
    try {
      // Get all daily data and extract pending tips
      const response = await fetch('/api/tips/history?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const pending: PendingTip[] = [];
        
        data.tips.forEach((tip: TipItem & { date: string }) => {
          if (tip.result === 'pending') {
            const mainEvent = tip.legs[0]?.event;
            const eventName = mainEvent?.name || `${mainEvent?.home} vs ${mainEvent?.away}` || 'Unknown Event';
            
            pending.push({
              id: `${tip.id}-${tip.date}`,
              tipId: tip.id,
              date: tip.date,
              file: `${tip.date}.json`,
              betType: tip.betType,
              risk: tip.risk,
              sport: tip.legs[0]?.sport,
              event: eventName,
              selection: tip.legs[0]?.selection || 'Unknown',
              odds: tip.betType === 'accumulator' ? (tip.combined?.avgOdds || 0) : (tip.legs[0]?.avgOdds || 0)
            });
          }
        });
        
        setPendingTips(pending.sort((a, b) => b.date.localeCompare(a.date)));
      }
    } catch (error) {
      console.error('Error loading pending tips:', error);
    }
  };

  const loadAllTips = async () => {
    try {
      // Get all tips with results
      const response = await fetch('/api/tips/history?limit=1000');
      if (response.ok) {
        const data = await response.json();
        const allTipsData: (PendingTip & { result: string })[] = [];
        
        data.tips.forEach((tip: TipItem & { date: string }) => {
          const mainEvent = tip.legs[0]?.event;
          const eventName = mainEvent?.name || `${mainEvent?.home} vs ${mainEvent?.away}` || 'Unknown Event';
          
          allTipsData.push({
            id: `${tip.id}-${tip.date}`,
            tipId: tip.id,
            date: tip.date,
            file: `${tip.date}.json`,
            betType: tip.betType,
            risk: tip.risk,
            sport: tip.legs[0]?.sport,
            event: eventName,
            selection: tip.legs[0]?.selection || 'Unknown',
            odds: tip.betType === 'accumulator' ? (tip.combined?.avgOdds || 0) : (tip.legs[0]?.avgOdds || 0),
            result: tip.result || 'pending'
          });
        });
        
        setAllTips(allTipsData.sort((a, b) => b.date.localeCompare(a.date)));
      }
    } catch (error) {
      console.error('Error loading all tips:', error);
    }
  };

  // Helper function to format validation errors
  const formatValidationErrors = (details: { path: (string | number)[]; message: string; code?: string }[]): string => {
    if (!details || details.length === 0) return '';

    // Group errors by type
    const errorGroups: { [key: string]: { path: (string | number)[]; message: string; code?: string }[] } = {};
    details.forEach(error => {
      const errorType = error.path[error.path.length - 1] || 'general';
      if (!errorGroups[errorType]) errorGroups[errorType] = [];
      errorGroups[errorType].push(error);
    });

    let formattedError = '';

    // Handle scheduledAt errors specifically
    if (errorGroups.scheduledAt) {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const maxFutureDate = new Date(startOfToday.getTime() + 90 * 24 * 60 * 60 * 1000);
      
      formattedError += `📅 ERROS DE DATA (${errorGroups.scheduledAt.length} eventos):\n`;
      formattedError += `   ✅ Intervalo válido: ${startOfToday.toISOString()} até ${maxFutureDate.toISOString()}\n`;
      formattedError += `   📍 Em português: de HOJE até ${maxFutureDate.toLocaleDateString('pt-PT')}\n\n`;
      
      errorGroups.scheduledAt.forEach((error) => {
        const tipIndex = Number(error.path[1]);
        const legIndex = Number(error.path[3]);
        formattedError += `   ❌ Tip ${tipIndex + 1}, Leg ${legIndex + 1}:\n`;
        formattedError += `      ${error.message}\n`;
        formattedError += `      Path: tips[${tipIndex}].legs[${legIndex}].event.scheduledAt\n\n`;
      });
    }

    // Handle other validation errors
    Object.keys(errorGroups).forEach(errorType => {
      if (errorType === 'scheduledAt') return; // Already handled

      formattedError += `❌ ERROS DE ${errorType.toUpperCase()}:\n`;
      errorGroups[errorType].forEach((error) => {
        formattedError += `   • ${error.message}\n`;
        if (error.path && error.path.length > 0) {
          formattedError += `     Path: ${error.path.join('.')}\n`;
        }
      });
      formattedError += '\n';
    });

    return formattedError;
  };

  const handleUpload = async () => {
    // Validate input based on mode
    if (uploadMode === 'file' && !uploadFile) {
      showToast('❌ Seleccione um ficheiro JSON', 'error');
      return;
    }
    if (uploadMode === 'text' && !jsonText.trim()) {
      showToast('❌ Cole o JSON na área de texto', 'error');
      return;
    }
    
    setIsLoading(true);
    setUploadResult(null);
    setUploadError(null);
    
    try {
      let jsonData;
      
      if (uploadMode === 'file' && uploadFile) {
        const fileContent = await uploadFile.text();
        jsonData = JSON.parse(fileContent);
      } else {
        jsonData = JSON.parse(jsonText);
      }
      
      const response = await fetch('/api/tips/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setUploadResult(`✅ Tips criadas com sucesso: ${result.data.tipCount} tips para ${result.data.dateISO}`);
        showToast(`✅ ${result.data.tipCount} tips criadas para ${result.data.dateISO}`, 'success');
        setUploadFile(null);
        setJsonText('');
        // Reload pending tips and all tips
        setTimeout(() => {
          loadPendingTips();
          loadAllTips();
        }, 1000);
      } else {
        // Format validation errors in a user-friendly way
        let errorMessage = `❌ ERRO DE VALIDAÇÃO: ${result.error}\n\n`;
        
        if (result.details && Array.isArray(result.details)) {
          errorMessage += formatValidationErrors(result.details);
          errorMessage += `\n💡 DICAS PARA CORRIGIR:\n`;
          errorMessage += `   • Eventos devem estar agendados de HOJE até 90 dias no futuro\n`;
          errorMessage += `   • Use datas no formato ISO: "2025-09-06T15:00:00.000Z"\n`;
          errorMessage += `   • Pode usar o template JSON fornecido acima como base\n`;
          errorMessage += `   • Valide o seu JSON num validador online antes do upload\n`;
          errorMessage += `   • Todas as datas devem estar em UTC (terminar com 'Z')\n`;
        }
        
        setUploadError(errorMessage);
        showToast(`❌ ${result.error} (${result.details?.length || 0} erros encontrados)`, 'error');
      }
    } catch (error) {
      const errorMsg = `❌ Erro ao processar ficheiro: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setUploadError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type === 'application/json') {
      setUploadFile(files[0]);
    }
  };

  const updateTipResult = async (tipId: string, result: 'win' | 'loss' | 'void', date?: string) => {
    setUpdatingResults(prev => new Set(prev).add(tipId));
    
    try {
      const response = await fetch('/api/tips/update-result', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipId,
          result,
          ...(date && { date })
        }),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        // Remove from pending tips
        setPendingTips(prev => prev.filter(tip => tip.tipId !== tipId));
        // Remove from selected results
        setSelectedResults(prev => {
          const newSelected = { ...prev };
          delete newSelected[tipId];
          return newSelected;
        });
        showToast(`✅ Resultado atualizado: ${result.toUpperCase()}`, 'success');
      } else {
        showToast(`❌ Erro: ${responseData.error}`, 'error');
      }
    } catch (error) {
      showToast(`❌ Erro: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setUpdatingResults(prev => {
        const newSet = new Set(prev);
        newSet.delete(tipId);
        return newSet;
      });
    }
  };

  const deleteTip = async (tipId: string) => {
    // Confirmation dialog
    if (!window.confirm(`Tem a certeza que quer eliminar permanentemente a tip "${tipId}"?\n\nEsta ação não pode ser desfeita!`)) {
      return;
    }

    setDeletingTips(prev => new Set(prev).add(tipId));
    
    try {
      const response = await fetch('/api/tips/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tipId }),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        // Remove from pending tips
        setPendingTips(prev => prev.filter(tip => tip.tipId !== tipId));
        // Remove from all tips
        setAllTips(prev => prev.filter(tip => tip.tipId !== tipId));
        // Remove from selected results
        setSelectedResults(prev => {
          const newSelected = { ...prev };
          delete newSelected[tipId];
          return newSelected;
        });
        showToast(`✅ Tip "${tipId}" eliminada permanentemente`, 'success');
      } else {
        showToast(`❌ Erro ao eliminar: ${responseData.error}`, 'error');
      }
    } catch (error) {
      showToast(`❌ Erro: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setDeletingTips(prev => {
        const newSet = new Set(prev);
        newSet.delete(tipId);
        return newSet;
      });
    }
  };

  const updateSelectedResults = async () => {
    const updates = Object.entries(selectedResults);
    if (updates.length === 0) return;
    
    setIsLoading(true);
    
    for (const [tipId, result] of updates) {
      const tip = pendingTips.find(t => t.tipId === tipId);
      await updateTipResult(tipId, result, tip?.date);
    }
    
    setIsLoading(false);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'safe': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'loss': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'void': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Admin Panel</CardTitle>
            <CardDescription>
              Insira a password para aceder ao painel administrativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Insira a password..."
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Its Probabl Admin</h1>
              <p className="text-sm text-muted-foreground">Gestão de Apostas</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Submeter Apostas
              </CardTitle>
              <CardDescription>
                {uploadMode === 'file' 
                  ? 'Faça upload de um ficheiro JSON com as apostas diárias' 
                  : 'Cole directamente o JSON das apostas na área de texto'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Mode Toggle */}
              <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Button
                  type="button"
                  variant={uploadMode === 'file' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setUploadMode('file');
                    setUploadError(null);
                    setUploadResult(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Ficheiro
                </Button>
                <Button
                  type="button"
                  variant={uploadMode === 'text' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setUploadMode('text');
                    setUploadError(null);
                    setUploadResult(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Texto
                </Button>
              </div>

              {uploadMode === 'file' ? (
                // File Upload Mode
                <>
                  {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  uploadFile ? 'border-green-300 bg-green-50 dark:bg-green-950' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                {uploadFile ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      📁 {uploadFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(uploadFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Arraste um ficheiro JSON aqui ou clique para selecionar
                    </p>
                    <p className="text-xs text-gray-400">
                      Apenas ficheiros .json são aceites
                    </p>
                  </div>
                )}
              </div>

              {/* File Input */}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept=".json"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || isLoading}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  Upload
                </Button>
              </div>
                </>
              ) : (
                // Text Input Mode
                <>
                  {/* Text Area */}
                  <div className="space-y-2">
                    <Label htmlFor="jsonTextArea" className="text-sm font-medium">
                      JSON das Apostas
                    </Label>
                    <textarea
                      id="jsonTextArea"
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                      placeholder="Cole aqui o JSON das apostas..."
                      className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fillTemplateInTextArea}
                        className="flex items-center gap-1"
                      >
                        📋 Preencher Template
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={formatJsonInTextArea}
                        className="flex items-center gap-1"
                        disabled={!jsonText.trim()}
                      >
                        ✨ Formatar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearTextArea}
                        className="flex items-center gap-1"
                        disabled={!jsonText.trim()}
                      >
                        🗑️ Limpar
                      </Button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleUpload}
                      disabled={!jsonText.trim() || isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      Submeter
                    </Button>
                  </div>
                </>
              )}

              {/* JSON Format Documentation */}
              <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                <details className="group">
                  <summary className="cursor-pointer font-semibold text-blue-800 dark:text-blue-200 list-none">
                    📋 Formato JSON Esperado (clique para expandir)
                  </summary>
                  <div className="mt-4 space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Estrutura Base:</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                  {`{
  "version": 2,
  "dateISO": "${validDates.today}",
  "generatedAt": "${new Date().toISOString()}",
  "generatedBy": "manual",
  "tips": [
    // Array de tips (ver exemplos abaixo)
  ],
  "seo": {
    "title": "Daily Tips for ${validDates.today}",
    "description": "Expert betting tips and analysis"
  }
}`}
                </pre>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Exemplo - Single Bet:</h4>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                  {`{
  "id": "tip-001",
  "betType": "single",
  "risk": "safe",
  "rationale": "Team has excellent home record.",
  "result": "pending",
  "legs": [
    {
      "sport": "Football",
      "league": "Premier League",
      "event": {
        "name": "Arsenal vs Liverpool",
        "home": "Arsenal",
        "away": "Liverpool",
        "scheduledAt": "${validDates.tomorrowAt15}",
        "timezone": "Europe/London"
      },
      "market": "Match Result",
      "selection": "Arsenal Win",
      "avgOdds": 2.50,
      "bookmakers": [
        { "name": "Bet365", "odds": 2.45, "url": "https://..." },
        { "name": "Betfair", "odds": 2.55, "url": "https://..." }
      ]
    }
  ]
}`}
                </pre>
              </div>

                    <div>
                      <h4 className="font-semibold mb-2">Exemplo - Accumulator:</h4>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs overflow-x-auto">
{`{
  "id": "tip-002",
  "betType": "accumulator",
  "risk": "medium",
  "rationale": "Both teams have strong offensive records.",
  "result": "pending",
  "legs": [
    {
      "sport": "Football",
      "league": "Premier League",
      "event": {
        "name": "Chelsea vs Manchester City",
        "home": "Chelsea",
        "away": "Manchester City",
        "scheduledAt": "${validDates.dayAfterAt17}",
        "timezone": "Europe/London"
      },
      "market": "Both Teams to Score",
      "selection": "Yes",
      "avgOdds": 1.60,
      "bookmakers": [
        { "name": "Bet365", "odds": 1.55 },
        { "name": "Betfair", "odds": 1.65 }
      ]
    },
    {
      "sport": "Football",
      "league": "La Liga",
      "event": {
        "name": "Barcelona vs Real Madrid",
        "home": "Barcelona",
        "away": "Real Madrid",
        "scheduledAt": "${validDates.dayAfterAt20}",
        "timezone": "Europe/Madrid"
      },
      "market": "Over/Under Goals",
      "selection": "Over 2.5",
      "avgOdds": 1.80,
      "bookmakers": [
        { "name": "Bet365", "odds": 1.75 },
        { "name": "Betfair", "odds": 1.85 }
      ]
    }
  ],
  "combined": {
    "avgOdds": 2.88,
    "bookmakers": [
      { "name": "Bet365", "odds": 2.71 },
      { "name": "Betfair", "odds": 3.05 }
    ]
  }
}`}
                      </pre>
                    </div>

                      <div>
                        <h4 className="font-semibold mb-2">Campos Obrigatórios:</h4>
                        <ul className="text-xs space-y-1 ml-4">
                          <li>• <code>version</code>: sempre 2</li>
                          <li>• <code>dateISO</code>: formato YYYY-MM-DD</li>
                          <li>• <code>generatedAt</code>: ISO datetime UTC</li>
                          <li>• <code>betType</code>: &quot;single&quot; | &quot;accumulator&quot;</li>
                          <li>• <code>risk</code>: &quot;safe&quot; | &quot;medium&quot; | &quot;high&quot;</li>
                          <li>• <code>result</code>: &quot;pending&quot; | &quot;win&quot; | &quot;loss&quot; | &quot;void&quot;</li>
                          <li>• <code>event.scheduledAt</code>: de HOJE até 90 dias futuro (UTC format)</li>
                        </ul>
                      </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        onClick={copyJsonTemplate}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-3 h-3" />
                        Copiar Template
                      </Button>
                      <Button
                        onClick={downloadJsonTemplate}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-3 h-3" />
                        Descarregar Template
                      </Button>
                    </div>

                    <div className="text-xs text-blue-600 dark:text-blue-300">
                      💡 <strong>Dica:</strong> Use um validador JSON online para verificar a sintaxe antes do upload!
                    </div>
                  </div>
                </details>
              </div>

              {/* Results */}
              {uploadResult && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                    {uploadResult}
                  </pre>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <pre className="text-sm text-red-800 dark:text-red-200 whitespace-pre-wrap">
                    {uploadError}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Gestão de Resultados
                  </CardTitle>
                  <CardDescription>
                    {pendingTips.length} apostas pendentes
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={loadPendingTips}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              
              {pendingTips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Não há apostas pendentes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Bulk Actions */}
                  {Object.keys(selectedResults).length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {Object.keys(selectedResults).length} selecionadas
                        </span>
                        <Button 
                          size="sm" 
                          onClick={updateSelectedResults}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                          ) : null}
                          Atualizar Resultados
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Pending Tips List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pendingTips.map((tip) => (
                      <div key={tip.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {tip.betType}
                              </Badge>
                              <Badge className={`text-xs ${getRiskColor(tip.risk)}`}>
                                {tip.risk}
                              </Badge>
                              {tip.sport && (
                                <Badge variant="outline" className="text-xs">
                                  {tip.sport}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-medium text-sm truncate">{tip.event}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {tip.selection}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {tip.date}
                              </span>
                              <span>@{tip.odds}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => updateTipResult(tip.tipId, 'win', tip.date)}
                            disabled={updatingResults.has(tip.tipId)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Win
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateTipResult(tip.tipId, 'loss', tip.date)}
                            disabled={updatingResults.has(tip.tipId)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Loss
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 text-gray-600 border-gray-200 hover:bg-gray-50"
                            onClick={() => updateTipResult(tip.tipId, 'void', tip.date)}
                            disabled={updatingResults.has(tip.tipId)}
                          >
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Void
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips Management - All Tips */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Gestão de Tips
                  </CardTitle>
                  <CardDescription>
                    {allTips.length} tips no total - Eliminar qualquer tip permanentemente
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => { loadAllTips(); loadPendingTips(); }}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              
              {allTips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <p>Não há tips para gerir</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {allTips.map((tip) => (
                    <div key={tip.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {tip.betType}
                            </Badge>
                            <Badge className={`text-xs ${getRiskColor(tip.risk)}`}>
                              {tip.risk}
                            </Badge>
                            <Badge className={`text-xs ${getResultColor(tip.result)}`}>
                              {tip.result.toUpperCase()}
                            </Badge>
                            {tip.sport && (
                              <Badge variant="outline" className="text-xs">
                                {tip.sport}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm truncate">{tip.event}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {tip.selection}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {tip.date}
                            </span>
                            <span>@{tip.odds}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="text-white bg-red-600 hover:bg-red-700 border-red-600"
                          onClick={() => deleteTip(tip.tipId)}
                          disabled={deletingTips.has(tip.tipId)}
                        >
                          {deletingTips.has(tip.tipId) ? (
                            <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-1" />
                          )}
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ToastProvider>
      <AdminPageContent />
    </ToastProvider>
  );
}
