'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { 
  Code2, Lock, Eye, Copy, Check, Clock, Calendar, 
  Sparkles, Shield, Zap, ArrowLeft, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'

// Language options for syntax highlighting
const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'plaintext', label: 'Plain Text' },
]

const EXPIRATION_OPTIONS = [
  { value: '1h', label: '1 Hora' },
  { value: '1d', label: '1 Dia' },
  { value: '1w', label: '1 Semana' },
  { value: 'never', label: 'Nunca' },
]

interface PasteData {
  id: string
  title: string
  language: string
  viewCount: number
  createdAt: string
  expiresAt: string | null
}

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const viewId = searchParams.get('view')
  
  const [mode, setMode] = useState<'editor' | 'view'>('editor')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [password, setPassword] = useState('')
  const [expiresIn, setExpiresIn] = useState('never')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // View mode state
  const [pasteData, setPasteData] = useState<PasteData | null>(null)
  const [rawContent, setRawContent] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [verifyPassword, setVerifyPassword] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  
  // Check if we're in view mode
  useEffect(() => {
    if (viewId) {
      setMode('view')
      fetchPasteData(viewId)
    } else {
      setMode('editor')
      setPasteData(null)
      setRawContent(null)
    }
  }, [viewId])
  
  const fetchPasteData = async (id: string) => {
    try {
      const response = await fetch(`/api/paste/${id}`)
      if (!response.ok) {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.error || 'Paste não encontrado',
          variant: 'destructive',
        })
        router.push('/')
        return
      }
      const data = await response.json()
      setPasteData(data)
    } catch {
      toast({
        title: 'Erro',
        description: 'Falha ao carregar paste',
        variant: 'destructive',
      })
      router.push('/')
    }
  }
  
  const handleCreatePaste = async () => {
    if (!title.trim()) {
      toast({
        title: 'Erro',
        description: 'O título é obrigatório',
        variant: 'destructive',
      })
      return
    }
    
    if (!content.trim()) {
      toast({
        title: 'Erro',
        description: 'O código é obrigatório',
        variant: 'destructive',
      })
      return
    }
    
    if (!password.trim() || password.length < 4) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 4 caracteres',
        variant: 'destructive',
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          language,
          password,
          expiresIn,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao criar paste')
      }
      
      const data = await response.json()
      
      toast({
        title: 'Sucesso!',
        description: 'Paste criado com sucesso',
      })
      
      // Navigate to view mode
      router.push(`/?view=${data.id}`)
      
      // Reset form
      setTitle('')
      setContent('')
      setPassword('')
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao criar paste',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleVerifyPassword = async () => {
    if (!verifyPassword.trim()) {
      toast({
        title: 'Erro',
        description: 'Digite a senha',
        variant: 'destructive',
      })
      return
    }
    
    if (!pasteData) return
    
    setIsVerifying(true)
    
    try {
      const response = await fetch(`/api/paste/${pasteData.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: verifyPassword }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Senha incorreta')
      }
      
      const data = await response.json()
      setRawContent(data.content)
      setShowPasswordModal(false)
      setVerifyPassword('')
      
      toast({
        title: 'Acesso liberado!',
        description: 'Agora você pode ver o código raw',
      })
      
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Senha incorreta',
        variant: 'destructive',
      })
    } finally {
      setIsVerifying(false)
    }
  }
  
  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência',
    })
  }, [toast])
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  
  // Editor Mode
  if (mode === 'editor') {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <img 
                    src="/logo.png" 
                    alt="Zenith Logo" 
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Zenith</h1>
                  <p className="text-xs text-muted-foreground">Código Protegido</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Shield className="w-3 h-3" />
                Protegido por Senha
              </Badge>
            </div>
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Compartilhe código com <span className="gradient-text">segurança</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Proteja seu código com senha. Ninguém pode ver o raw sem a senha correta.
            </p>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
            <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <Lock className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Proteção Total</h3>
                <p className="text-sm text-muted-foreground">
                  Senha obrigatória para ver o código raw
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-accent/20 hover:border-accent/40 transition-colors">
              <CardContent className="pt-6">
                <Sparkles className="w-8 h-8 text-accent mb-3" />
                <h3 className="font-semibold mb-1">Syntax Highlight</h3>
                <p className="text-sm text-muted-foreground">
                  Suporte para mais de 20 linguagens
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/20 hover:border-primary/40 transition-colors">
              <CardContent className="pt-6">
                <Zap className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Expiração</h3>
                <p className="text-sm text-muted-foreground">
                  Defina quando seu paste expira
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Editor */}
        <section className="container mx-auto px-4 pb-8">
          <Card className="max-w-4xl mx-auto glow-purple">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code2 className="w-5 h-5" />
                Novo Paste
              </CardTitle>
              <CardDescription>
                Cole seu código abaixo e proteja com uma senha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  placeholder="Ex: Minha API em Node.js"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-input/50"
                />
              </div>
              
              {/* Language & Expiration Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Linguagem</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full bg-input/50">
                      <SelectValue placeholder="Selecione a linguagem" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Expira em</Label>
                  <Select value={expiresIn} onValueChange={setExpiresIn}>
                    <SelectTrigger className="w-full bg-input/50">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPIRATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Code Editor */}
              <div className="space-y-2">
                <Label htmlFor="content">Código</Label>
                <div className="relative">
                  <textarea
                    id="content"
                    placeholder="Cole seu código aqui..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-80 p-4 rounded-lg bg-input/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none font-mono text-sm"
                    spellCheck={false}
                  />
                </div>
              </div>
              
              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Senha de Proteção
                  </span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 4 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-input/50"
                />
                <p className="text-xs text-muted-foreground">
                  Esta senha será necessária para ver o código raw
                </p>
              </div>
              
              {/* Submit Button */}
              <Button
                onClick={handleCreatePaste}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-semibold py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Criar Paste Protegido
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </section>
        
        {/* Footer */}
        <footer className="border-t border-border/50 py-6">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Zenith © {new Date().getFullYear()} - Seu código, protegido.</p>
          </div>
        </footer>
      </div>
    )
  }
  
  // View Mode
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="relative w-10 h-10">
                <img 
                  src="/logo.png" 
                  alt="Zenith Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Zenith</h1>
                <p className="text-xs text-muted-foreground">Código Protegido</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Novo Paste
            </Button>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {pasteData ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Paste Info Card */}
            <Card className="glow-purple">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{pasteData.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(pasteData.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {pasteData.viewCount} visualizações
                      </span>
                      {pasteData.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Expira: {formatDate(pasteData.expiresAt)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-primary to-accent">
                    {LANGUAGES.find(l => l.value === pasteData.language)?.label || pasteData.language}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <Button
                    onClick={() => setShowPasswordModal(true)}
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    disabled={!!rawContent}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {rawContent ? 'Raw Visível' : 'Ver Raw'}
                  </Button>
                  
                  {rawContent && (
                    <Button
                      variant="outline"
                      onClick={() => handleCopy(rawContent)}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Raw
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                {/* Protected Message or Raw Content */}
                {!rawContent ? (
                  <div className="bg-muted/50 rounded-lg p-8 text-center">
                    <Lock className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Código Protegido</h3>
                    <p className="text-muted-foreground mb-4">
                      Este paste está protegido por senha. Clique em &quot;Ver Raw&quot; para inserir a senha.
                    </p>
                    <Badge variant="outline" className="gap-1">
                      <Shield className="w-3 h-3" />
                      Protegido
                    </Badge>
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <SyntaxHighlighter
                      language={pasteData.language}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0.5rem',
                        maxHeight: '600px',
                      }}
                      showLineNumbers
                    >
                      {rawContent}
                    </SyntaxHighlighter>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </main>
      
      {/* Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Digite a Senha
            </DialogTitle>
            <DialogDescription>
              Insira a senha para ver o código raw deste paste.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verify-password">Senha</Label>
              <Input
                id="verify-password"
                type="password"
                placeholder="Digite a senha..."
                value={verifyPassword}
                onChange={(e) => setVerifyPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                className="bg-input/50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleVerifyPassword}
              disabled={isVerifying}
              className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
