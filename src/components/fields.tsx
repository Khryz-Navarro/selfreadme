import { useId } from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  textarea?: boolean
  placeholder?: string
}

export function TextField({ label, value, onChange, textarea, placeholder }: TextFieldProps) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {textarea ? (
        <Textarea id={id} rows={3} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      ) : (
        <Input id={id} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      )}
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  options: [value: string, label: string][]
  onChange: (value: string) => void
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const id = useId()
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([v, l]) => (
            <SelectItem key={v} value={v}>{l}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function move<T>(items: T[], i: number, delta: number) {
  const j = i + delta
  if (j < 0 || j >= items.length) return items
  const next = [...items]
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export function MoveButtons({ index, count, onMove, label }: { index: number; count: number; onMove: (delta: number) => void; label: string }) {
  return (
    <>
      <Button variant="ghost" size="icon-sm" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)}>
        <ArrowUp />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(1)}>
        <ArrowDown />
      </Button>
    </>
  )
}

export interface Field<T> {
  key: keyof T & string
  label: string
  textarea?: boolean
  placeholder?: string
  options?: [string, string][]
  wide?: boolean
}

interface ListEditorProps<T> {
  items: T[]
  fields: Field<T>[]
  blank: T
  addLabel: string
  itemLabel: (item: T, index: number) => string
  onChange: (items: T[]) => void
}

export function ListEditor<T>({ items, fields, blank, addLabel, itemLabel, onChange }: ListEditorProps<T>) {
  const set = (i: number, key: keyof T, value: string) => onChange(items.map((it, j) => (j === i ? { ...it, [key]: value } : it)))
  return (
    <div className="grid gap-3">
      {items.map((item, i) => {
        const name = itemLabel(item, i)
        return (
          <div key={i} className="rounded-lg border bg-muted/30 p-3">
            <div className="mb-2 flex items-center gap-1">
              <span className="mr-auto truncate text-sm font-medium">{name}</span>
              <MoveButtons index={i} count={items.length} label={name} onMove={d => onChange(move(items, i, d))} />
              <Button variant="ghost" size="icon-sm" aria-label={`Remove ${name}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 />
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map(f => (
                <div key={f.key} className={f.wide || f.textarea ? 'sm:col-span-2' : undefined}>
                  {f.options ? (
                    <SelectField label={f.label} value={item[f.key] as string} options={f.options} onChange={v => set(i, f.key, v)} />
                  ) : (
                    <TextField label={f.label} value={item[f.key] as string} textarea={f.textarea} placeholder={f.placeholder} onChange={v => set(i, f.key, v)} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
      <Button variant="outline" className="justify-self-start" onClick={() => onChange([...items, { ...blank }])}>
        <Plus /> {addLabel}
      </Button>
    </div>
  )
}
