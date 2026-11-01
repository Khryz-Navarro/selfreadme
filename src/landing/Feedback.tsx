import { useEffect, useId, useState, type FormEvent } from 'react'
import { MessageSquareText } from 'lucide-react'
import { SelectField } from '@/components/fields'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// FormSubmit forwards each submission to this inbox; its first one triggers an activation email.
// shortcut: the address is visible in the page's code; swap it for the random alias FormSubmit sends after activation.
const FEEDBACK_URL = 'https://formsubmit.co/ajax/khryznavarro@gmail.com'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Feedback() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('Bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [heroVisible, setHeroVisible] = useState(true)
  const messageId = useId()
  const emailId = useId()

  // Hidden while the hero fills the bottom strip of the screen, where the button would cover its "Build my README" tile.
  // Ratio, not isIntersecting: an edge that only touches the strip shouldn't count.
  useEffect(() => {
    const hero = document.querySelector('.hero')
    if (!hero || !('IntersectionObserver' in window)) { setHeroVisible(false); return }
    const io = new IntersectionObserver(([entry]) => setHeroVisible(entry.intersectionRatio > 0), { rootMargin: '-92% 0px 0px 0px' })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const r = await fetch(FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `Selfreadme feedback: ${type}`,
          _template: 'table',
          _captcha: 'false',
          // Hidden from people; bots that fill it in are dropped by FormSubmit.
          _honey: new FormData(e.currentTarget).get('_honey') ?? '',
          type,
          message: message.trim(),
          ...(email.trim() && { email: email.trim() }),
          page: location.href,
          browser: navigator.userAgent,
          viewport: `${innerWidth} × ${innerHeight}`,
          screen: `${screen.width} × ${screen.height}`,
          language: navigator.language,
        }),
      })
      const result = await r.json().catch(() => ({}))
      if (!r.ok || String(result.success) !== 'true') throw new Error(result.message ?? String(r.status))
      setStatus('sent')
      setMessage('')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (o && status !== 'sending') setStatus('idle') }}>
      <DialogTrigger asChild>
        <Button
          className={`feedback-button fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 h-11 px-4 text-sm font-semibold shadow-lg transition-[opacity,translate,visibility] duration-300 motion-reduce:transition-none ${
            heroVisible && !open ? 'invisible translate-y-3 opacity-0' : 'visible translate-y-0 opacity-100'
          }`}
        >
          <MessageSquareText /> Feedback
        </Button>
      </DialogTrigger>
      <DialogContent>
        {status === 'sent' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-tight">Thanks for the feedback</DialogTitle>
              <DialogDescription>It's on its way to the developer. If you left your email, you may get a reply.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button>Close</Button></DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={send} className="grid gap-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold tracking-tight">Send feedback</DialogTitle>
              <DialogDescription>Found a bug or have an idea? It goes straight to the developer.</DialogDescription>
            </DialogHeader>
            <SelectField label="Type" value={type} onChange={setType} options={[['Bug', 'Bug'], ['Idea', 'Idea'], ['Other', 'Other']]} />
            <div className="grid gap-1.5">
              <Label htmlFor={messageId}>Message</Label>
              <Textarea
                id={messageId} required maxLength={2000} rows={5} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="What happened, or what would you like to see?"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor={emailId}>Your email <span className="font-normal text-muted-foreground">(optional, for a reply)</span></Label>
              <Input id={emailId} type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <p className="text-sm text-muted-foreground">
              Your browser, screen size and this page's address are attached to help fix bugs. Nothing from your profile is sent.
            </p>
            {status === 'error' && (
              <p role="alert" className="text-sm text-destructive">Couldn't send your feedback. Check your connection and try again.</p>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send feedback'}</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
