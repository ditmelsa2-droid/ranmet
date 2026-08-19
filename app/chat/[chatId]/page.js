import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatRoom from './ChatRoom'

export default async function ChatPage({ params }) {
  const { chatId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: chat } = await supabase.from('chats').select('*').eq('id', chatId).single()
  if (!chat) notFound()
  // RLS already blocks cross-account reads, but double-check explicitly so we
  // can show a clean "not found" instead of an empty/broken page.
  if (chat.user_a !== user.id && chat.user_b !== user.id) notFound()

  const otherId = chat.user_a === user.id ? chat.user_b : chat.user_a
  const { data: otherProfile } = await supabase.from('profiles').select('display_name, country').eq('id', otherId).single()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  return (
    <ChatRoom
      chatId={chatId}
      myId={user.id}
      otherName={otherProfile?.display_name || 'Người dùng'}
      compatibility={chat.compatibility}
      initialMessages={messages || []}
    />
  )
}
