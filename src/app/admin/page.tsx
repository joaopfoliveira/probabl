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
  RefreshCw
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
  
  // Results management
  const [pendingTips, setPendingTips] = useState<PendingTip[]>([]);
  const [selectedResults, setSelectedResults] = useState<Record<string, 'win' | 'loss' | 'void'>>({});
  const [updatingResults, setUpdatingResults] = useState<Set<string>>(new Set());

  // Check authentication on mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Load pending tips when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadPendingTips();
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
    setPendingTips([]);
    setSelectedResults({});
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

  const handleFileUpload = async () => {
    if (!uploadFile) return;
    
    setIsLoading(true);
    setUploadResult(null);
    setUploadError(null);
    
    try {
      const fileContent = await uploadFile.text();
      const jsonData = JSON.parse(fileContent);
      
      const response = await fetch('/api/tips/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setUploadResult(`✅ Tips criadas com sucesso: ${result.data.tipsCount} tips para ${result.data.date}`);
        showToast(`✅ ${result.data.tipsCount} tips criadas para ${result.data.date}`, 'success');
        setUploadFile(null);
        // Reload pending tips
        setTimeout(() => loadPendingTips(), 1000);
      } else {
        setUploadError(`❌ Erro: ${result.error}${result.details ? '\n' + JSON.stringify(result.details, null, 2) : ''}`);
        showToast(`❌ Erro: ${result.error}`, 'error');
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
                Faça upload de um ficheiro JSON com as apostas diárias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
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
                  onClick={handleFileUpload}
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
