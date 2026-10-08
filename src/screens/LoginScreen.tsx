import { useState } from 'react'
import { BarChart2, Eye, EyeOff, Info, Lock, Mail, Target, Users, Zap } from 'lucide-react'

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'demo@mayvexa.com' && password === '123456') {
      onLogin()
    } else {
      setError('Invalid credentials. Please use the demo account.')
    }
  }

  return (
    <div className="flex min-h-screen w-full overflow-hidden bg-[#07090f] font-sans text-neutral-100">
      {/* Left side */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 lg:flex">
        {/* Background effects */}
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-900/20 blur-[100px]" />
        <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-purple-900/20 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-900/30 blur-[120px]" />
        
        {/* Earth curve simulation */}
        <div className="absolute -bottom-[400px] left-1/2 h-[600px] w-[1200px] -translate-x-1/2 rounded-[100%] border-t border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-transparent shadow-[0_-30px_100px_rgba(30,58,138,0.3)]" />

        <div className="relative z-10">
          <div className="mb-16">
            <h1 className="text-4xl font-bold tracking-[-0.04em]">
              <BrandName />
            </h1>
            <p className="mt-2 text-[11px] font-medium tracking-[0.2em] text-neutral-400">
              LEADS · CONVERSATIONS · GROWTH
            </p>
          </div>

          <div className="max-w-xl">
            <h2 className="text-[56px] font-bold leading-[1.1] tracking-tight">
              Turn <br />
              <span className="text-[#4ecbff] drop-shadow-[0_0_18px_rgba(78,203,255,0.35)]">Relationships</span>
              <br />
              into Revenue<span className="font-light text-neutral-500">|</span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-neutral-400">
              A modern CRM to capture leads, nurture relationships and close opportunities — built for modern businesses.
            </p>

            <div className="mt-12 grid grid-cols-4 gap-6">
              <Feature icon={<Users size={20} />} title="Manage\nLeads" color="text-[#4fd17e]" bg="bg-[#2f9e57]/10" border="border-[#2f9e57]/20" />
              <Feature icon={<BarChart2 size={20} />} title="Track\nPipeline" color="text-[#3d8bfd]" bg="bg-[#3d8bfd]/10" border="border-[#3d8bfd]/20" />
              <Feature icon={<Zap size={20} />} title="Take\nAction" color="text-[#c084fc]" bg="bg-[#a855f7]/10" border="border-[#a855f7]/20" />
              <Feature icon={<Target size={20} />} title="Convert\n& Grow" color="text-[#f0c36a]" bg="bg-[#e8a93a]/10" border="border-[#e8a93a]/20" />
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] font-medium tracking-[0.2em] text-neutral-500">
            PEOPLE · OPPORTUNITIES · PROGRESS
          </p>
          <p className="mt-2 text-sm font-medium tracking-[0.3em] text-neutral-300">
            ALL IN ONE PLACE
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="relative flex w-full flex-col items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_75%_15%,rgba(91,75,255,0.16),transparent_30%),radial-gradient(circle_at_20%_85%,rgba(0,198,255,0.10),transparent_32%)] p-6 lg:w-1/2">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/5" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/5" />

        <div className="absolute right-8 top-8 flex items-center gap-4 text-sm">
          <span className="text-neutral-400">New here?</span>
          <button type="button" className="rounded-full border border-[#323235] px-5 py-2 font-medium transition-colors hover:bg-[#1f1f22]">
            Create account
          </button>
        </div>

        <div className="relative w-full max-w-[440px] overflow-hidden rounded-[32px] border border-white/10 bg-[#101118]/90 p-10 shadow-[0_30px_100px_rgba(0,0,0,0.55),0_0_70px_rgba(79,70,229,0.10)] backdrop-blur-xl">
          <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-[#7c5cff] to-transparent shadow-[0_0_18px_2px_rgba(124,92,255,0.8)]" />
          <div className="text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-300/70">
              Your growth workspace
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.03em]">
              Welcome to <BrandName />
            </h2>
            <p className="mt-3 text-[15px] text-neutral-400">
              Sign in to your account and continue your journey.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button type="button" className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#323235] bg-[#161617] text-[15px] font-medium transition-colors hover:bg-[#1f1f22]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
              </svg>
              Continue with Google
            </button>
            <button type="button" className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#323235] bg-[#161617] text-[15px] font-medium transition-colors hover:bg-[#1f1f22]">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.126 3.805 3.07 1.52-.055 2.095-.976 3.935-.976 1.84 0 2.36.976 3.96.945 1.627-.027 2.65-1.517 3.66-2.978 1.161-1.7 1.64-3.35 1.66-3.434-.038-.016-3.215-1.23-3.24-4.912-.02-3.08 2.52-4.56 2.64-4.63-1.44-2.106-3.68-2.39-4.49-2.43-2.04-.158-4.01 1.282-5.02 1.282zm-.49-1.56c1.02-.123 2.14-.68 2.82-1.51.62-.76.99-1.84.86-2.93-1.02.04-2.22.68-2.9 1.44-.6.67-1.04 1.76-.89 2.83.92.07 2.02-.63 2.66-1.4z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#262628]" />
            <span className="text-[13px] text-neutral-500">or</span>
            <div className="h-px flex-1 bg-[#262628]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[13px] text-neutral-400">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#323235] bg-[#141415] pl-11 pr-4 text-[15px] outline-none focus:border-[#3b82f6]"
                  placeholder="demo@mayvexa.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[13px] text-neutral-400">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-[#323235] bg-[#141415] pl-11 pr-11 text-[15px] outline-none focus:border-[#3b82f6]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[14px] text-neutral-300">
                <input type="checkbox" className="h-4 w-4 rounded border-[#323235] bg-[#141415] accent-[#3b82f6]" defaultChecked />
                Remember me
              </label>
              <a href="#" className="text-[14px] text-[#3b82f6] hover:underline">
                Forgot password?
              </a>
            </div>

            {error && <p className="text-sm text-[#f07a7a]">{error}</p>}

            <button
              type="submit"
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7c5cff] text-[16px] font-semibold text-white shadow-[0_12px_35px_rgba(124,92,255,0.45)] transition-all hover:scale-[1.02] hover:bg-[#8b6dff] active:scale-[0.98]"
            >
              Sign in &rarr;
            </button>
          </form>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-[#262628] bg-[#161617] p-4 text-sm">
            <Info size={18} className="mt-0.5 shrink-0 text-[#3b82f6]" />
            <div>
              <p className="font-medium text-neutral-300">Use demo credentials</p>
              <p className="mt-1 text-neutral-400">
                Email: <span className="text-neutral-200">demo@mayvexa.com</span> <span className="mx-1 text-neutral-600">|</span> Password: <span className="text-neutral-200">123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BrandName() {
  return (
    <span className="whitespace-nowrap">
      <span className="text-white">May</span>
      <span className="inline-block pr-1 text-[#8f7cff] drop-shadow-[0_0_14px_rgba(143,124,255,0.55)]">
        Vexa
      </span>
    </span>
  )
}

function Feature({ icon, title, color, bg, border }: { icon: React.ReactNode; title: string; color: string; bg: string; border: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className={`flex size-14 items-center justify-center rounded-2xl border ${border} ${bg} ${color}`}>
        {icon}
      </div>
      <span className="whitespace-pre-line text-[13px] font-medium leading-tight text-neutral-300">
        {title}
      </span>
    </div>
  )
}
