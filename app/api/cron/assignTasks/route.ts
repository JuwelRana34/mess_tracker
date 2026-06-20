// // app/api/cron/assignTasks/route.ts
// import { NextResponse } from 'next/server';
// import { createClient } from '@supabase/supabase-js';
// export async function GET() {
//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
//   const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
//   // Service Role Key দিয়ে তৈরি করা ক্লায়েন্ট (RLS বাইপাস করবে)
//   const supabase = createClient(supabaseUrl, supabaseServiceKey)
//   try {
//     console.log('-----------------------------------')
//     console.log('১. ক্রন জব API কল হয়েছে (স্মার্ট মোড)...')
//     const { data: groups, error: groupsError } = await supabase
//       .from('groups')
//       .select('*')
//     if (groupsError) throw groupsError
//     if (!groups || groups.length === 0) {
//       console.log('কোনো মেস/গ্রুপ পাওয়া যায়নি!')
//       return NextResponse.json({ message: 'No groups found.' })
//     }
//     console.log(`মোট ${groups.length} টি গ্রুপ পাওয়া গেছে।`)
//     // আজকের তারিখ বের করা
//     const today = new Date()
//     today.setHours(0, 0, 0, 0)
//     const todayStr = today.toISOString()
//     let totalTasksCreated = 0
//     // দিন হিসাব করার লজিক (কত দিন আগে কাজ দেওয়া হয়েছিল)
//     const shouldCreateNewTask = (
//       lastTaskDateStr: string | null,
//       requiredGapDays: number
//     ) => {
//       if (!lastTaskDateStr) return true // যদি আগে কোনো কাজই না থাকে, তবে কাজ বানাবে
//       const lastDate = new Date(lastTaskDateStr)
//       lastDate.setHours(0, 0, 0, 0)
//       const diffTime = today.getTime() - lastDate.getTime()
//       const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
//       return diffDays >= requiredGapDays
//     }
//     for (const group of groups) {
//       console.log(`\n>> গ্রুপ আইডি: ${group.id} চেক করা হচ্ছে...`)
//       // ==========================================
//       // ১. ময়লা (Trash) অ্যাসাইনমেন্ট লজিক (২ দিন পর পর)
//       // ==========================================
//       const { data: lastTrash } = await supabase
//         .from('tasks')
//         .select('due_date')
//         .eq('group_id', group.id)
//         .eq('type', 'trash')
//         .order('due_date', { ascending: false })
//         .limit(1)
//         .maybeSingle()
//       // যদি ২ দিন পার হয়ে থাকে, তবেই নতুন কাজ বানাবে
//       // 'isActive' চেক করার জন্য আপডেট করা কোড
//       if (shouldCreateNewTask(lastTrash?.due_date, 2)) {
//         const { data: trashUser, error: trashUserError } = await supabase
//           .from('users')
//           .select('id')
//           .eq('group_id', group.id)
//           .eq('group_serial', group.current_trash_turn)
//           .eq('isActive', true) // 🌟 এই লাইনটি যোগ করা হয়েছে
//           .limit(1)
//           .maybeSingle()
//         if (trashUser) {
//           await supabase.from('tasks').insert({
//             group_id: group.id,
//             type: 'trash',
//             status: 'pending',
//             due_date: todayStr,
//             assigned_to: trashUser.id,
//           })
//           console.log(`✅ ময়লার টাস্ক তৈরি হয়েছে!`)
//           totalTasksCreated++
//           const nextTrashTurn =
//             group.current_trash_turn >= group.total_members
//               ? 1
//               : group.current_trash_turn + 1
//           await supabase
//             .from('groups')
//             .update({ current_trash_turn: nextTrashTurn })
//             .eq('id', group.id)
//         } else {
//           // যদি ওই সিরিয়ালের ইউজার ইনঅ্যাক্টিভ থাকে, তবে কি করবেন?
//           // পরামর্শ: এখানে সিরিয়ালটা পরের জনের কাছে পাঠিয়ে দেয়া ভালো, নাহলে ডিউটি আটকে যাবে।
//           console.log(
//             `⚠️ ওই সিরিয়ালের ইউজার ইনঅ্যাক্টিভ, তাই কাজ অ্যাসাইন হয়নি।`
//           )
//           // অটোমেটিক সিরিয়াল আপডেট করে দেয়া যাতে ডিউটি না আটকে যায়
//           const nextTrashTurn =
//             group.current_trash_turn >= group.total_members
//               ? 1
//               : group.current_trash_turn + 1
//           await supabase
//             .from('groups')
//             .update({ current_trash_turn: nextTrashTurn })
//             .eq('id', group.id)
//         }
//       }
// // ==========================================
//       // ২. টয়লেট (Toilet) অ্যাসাইনমেন্ট লজিক (৭ দিন পর পর)
//       // ==========================================
//       const { data: lastToilet } = await supabase
//         .from('tasks')
//         .select('due_date')
//         .eq('group_id', group.id)
//         .eq('type', 'toilet')
//         .order('due_date', { ascending: false })
//         .limit(1)
//         .maybeSingle()
//       if (shouldCreateNewTask(lastToilet?.due_date, 7)) {
//         const { data: toiletUser, error: toiletUserError } = await supabase
//           .from('users')
//           .select('id')
//           .eq('group_id', group.id)
//           .eq('group_serial', group.current_toilet_turn)
//           .eq('isActive', true) // 🌟 ইনঅ্যাক্টিভ চেক
//           .limit(1)
//           .maybeSingle()
//         if (toiletUser) {
//           await supabase.from('tasks').insert({
//             group_id: group.id,
//             type: 'toilet',
//             status: 'pending',
//             due_date: todayStr,
//             assigned_to: toiletUser.id,
//           })
//           console.log(`✅ টয়লেটের টাস্ক তৈরি হয়েছে!`)
//           totalTasksCreated++
//           const nextToiletTurn = group.current_toilet_turn >= group.total_members ? 1 : group.current_toilet_turn + 1
//           await supabase.from('groups').update({ current_toilet_turn: nextToiletTurn }).eq('id', group.id)
//         } else {
//           // যদি ইনঅ্যাক্টিভ হয়, তবে সিরিয়াল বাড়িয়ে পরের জনের কাছে পাঠিয়ে দাও
//           console.log(`⚠️ টয়লেটের জন্য নির্ধারিত ইউজার ইনঅ্যাক্টিভ, সিরিয়াল স্কিপ করা হলো।`)
//           const nextToiletTurn = group.current_toilet_turn >= group.total_members ? 1 : group.current_toilet_turn + 1
//           await supabase.from('groups').update({ current_toilet_turn: nextToiletTurn }).eq('id', group.id)
//         }
//       } else {
//         console.log(`⏳ টয়লেটের সময় এখনো হয়নি (৭ দিন পার হয়নি)। স্কিপ করা হলো।`)
//       }
//     }
//     console.log(`\nসর্বমোট নতুন টাস্ক তৈরি হয়েছে: ${totalTasksCreated} টি`)
//     console.log('-----------------------------------')
//     return NextResponse.json({
//       success: true,
//       tasksCreated: totalTasksCreated,
//       message: 'Auto-assigned tasks execution finished.',
//     })
//   } catch (error) {
//     console.error('Cron Error:', error)
//     return NextResponse.json(
//       { error: 'An error occurred while assigning tasks.' },
//       { status: 500 }
//     )
//   }
// }
// app/api/cron/assignTasks/route.ts
import { NextResponse } from 'next/server';



import { createClient } from '@supabase/supabase-js';



































































































































































export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  // Service Role Key দিয়ে তৈরি করা ক্লায়েন্ট (RLS বাইপাস করবে)
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('-----------------------------------')
    console.log('১. ক্রন জব API কল হয়েছে (স্মার্ট মোড)...')

    // আজকের তারিখ বের করা (রাত ১২টা)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    // ==========================================
    // 🚨 ওভারডিউ/মিসড টাস্ক চেক এবং পেনাল্টি (শাস্তি)
    // ==========================================
    console.log('🔍 ওভারডিউ (পেন্ডিং) কাজ চেক করা হচ্ছে...')
    const { data: overdueTasks, error: overdueError } = await supabase
      .from('tasks')
      .select('id, assigned_to')
      .eq('status', 'pending')
      .lt('due_date', todayStr) // আজকের আগের সব ডেট

    if (overdueError) {
      console.error('ওভারডিউ কাজ খুঁজতে সমস্যা:', overdueError.message)
    }

    if (overdueTasks && overdueTasks.length > 0) {
      console.log(
        `🚨 ${overdueTasks.length} টি ওভারডিউ কাজ পাওয়া গেছে। শাস্তি দেওয়া শুরু হচ্ছে...`
      )

      for (const task of overdueTasks) {
        // ১. কাজটাকে 'missed' মার্ক করা
        await supabase
          .from('tasks')
          .update({ status: 'missed' })
          .eq('id', task.id)

        // ২. ইউজারের স্কিপ ক্রেডিট থেকে ১ কেটে নেওয়া (Penalty)
        const { data: userRecord } = await supabase
          .from('users')
          .select('skip_credit')
          .eq('id', task.assigned_to)
          .maybeSingle()

        if (userRecord) {
          const currentCredit = userRecord.skip_credit || 0
          await supabase
            .from('users')
            .update({ skip_credit: currentCredit - 1 })
            .eq('id', task.assigned_to)

          console.log(
            `❌ ইউজার ID ${task.assigned_to} এর কাজ 'missed' করা হয়েছে এবং ১ ক্রেডিট কাটা হয়েছে!`
          )
        }
      }
    } else {
      console.log('✅ কোনো ওভারডিউ কাজ নেই। সবাই কাজ কমপ্লিট করেছে!')
    }

    // ==========================================
    // 🚀 নতুন টাস্ক অ্যাসাইনমেন্ট শুরু
    // ==========================================
    const { data: groups, error: groupsError } = await supabase
      .from('groups')
      .select('*')

    if (groupsError) throw groupsError

    if (!groups || groups.length === 0) {
      console.log('কোনো মেস/গ্রুপ পাওয়া যায়নি!')
      return NextResponse.json({ message: 'No groups found.' })
    }

    console.log(`মোট ${groups.length} টি গ্রুপ পাওয়া গেছে।`)
    let totalTasksCreated = 0

    // দিন হিসাব করার লজিক (কত দিন আগে কাজ দেওয়া হয়েছিল)
    const shouldCreateNewTask = (
      lastTaskDateStr: string | null,
      requiredGapDays: number
    ) => {
      if (!lastTaskDateStr) return true // যদি আগে কোনো কাজই না থাকে, তবে কাজ বানাবে
      const lastDate = new Date(lastTaskDateStr)
      lastDate.setHours(0, 0, 0, 0)
      const diffTime = today.getTime() - lastDate.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= requiredGapDays
    }

    for (const group of groups) {
      console.log(`\n>> গ্রুপ আইডি: ${group.id} চেক করা হচ্ছে...`)

      // ==========================================
      // ১. ময়লা (Trash) অ্যাসাইনমেন্ট লজিক (২ দিন পর পর)
      // ==========================================
      const { data: lastTrash } = await supabase
        .from('tasks')
        .select('due_date')
        .eq('group_id', group.id)
        .eq('type', 'trash')
        .order('due_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      // যদি ২ দিন পার হয়ে থাকে, তবেই নতুন কাজ বানাবে
      if (shouldCreateNewTask(lastTrash?.due_date, 2)) {
        const { data: trashUser, error: trashUserError } = await supabase
          .from('users')
          .select('id')
          .eq('group_id', group.id)
          .eq('group_serial', group.current_trash_turn)
          .eq('isActive', true) // 🌟 ইনঅ্যাক্টিভ চেক
          .limit(1)
          .maybeSingle()

        if (trashUser) {
          await supabase.from('tasks').insert({
            group_id: group.id,
            type: 'trash',
            status: 'pending',
            due_date: todayStr,
            assigned_to: trashUser.id,
          })
          console.log(`✅ ময়লার টাস্ক তৈরি হয়েছে!`)
          totalTasksCreated++

          const nextTrashTurn =
            group.current_trash_turn >= group.total_members
              ? 1
              : group.current_trash_turn + 1
          await supabase
            .from('groups')
            .update({ current_trash_turn: nextTrashTurn })
            .eq('id', group.id)
        } else {
          console.log(
            `⚠️ ওই সিরিয়ালের ইউজার ইনঅ্যাক্টিভ, তাই কাজ অ্যাসাইন হয়নি। সিরিয়াল স্কিপ করা হলো।`
          )
          const nextTrashTurn =
            group.current_trash_turn >= group.total_members
              ? 1
              : group.current_trash_turn + 1
          await supabase
            .from('groups')
            .update({ current_trash_turn: nextTrashTurn })
            .eq('id', group.id)
        }
      } else {
        console.log(
          `⏳ ময়লার সময় এখনো হয়নি (২ দিন পার হয়নি)। স্কিপ করা হলো।`
        )
      }

      // ==========================================
      // ২. টয়লেট (Toilet) অ্যাসাইনমেন্ট লজিক (৭ দিন পর পর)
      // ==========================================
      const { data: lastToilet } = await supabase
        .from('tasks')
        .select('due_date')
        .eq('group_id', group.id)
        .eq('type', 'toilet')
        .order('due_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (shouldCreateNewTask(lastToilet?.due_date, 7)) {
        const { data: toiletUser, error: toiletUserError } = await supabase
          .from('users')
          .select('id')
          .eq('group_id', group.id)
          .eq('group_serial', group.current_toilet_turn)
          .eq('isActive', true) // 🌟 ইনঅ্যাক্টিভ চেক
          .limit(1)
          .maybeSingle()

        if (toiletUser) {
          await supabase.from('tasks').insert({
            group_id: group.id,
            type: 'toilet',
            status: 'pending',
            due_date: todayStr,
            assigned_to: toiletUser.id,
          })
          console.log(`✅ টয়লেটের টাস্ক তৈরি হয়েছে!`)
          totalTasksCreated++

          const nextToiletTurn =
            group.current_toilet_turn >= group.total_members
              ? 1
              : group.current_toilet_turn + 1
          await supabase
            .from('groups')
            .update({ current_toilet_turn: nextToiletTurn })
            .eq('id', group.id)
        } else {
          console.log(
            `⚠️ টয়লেটের জন্য নির্ধারিত ইউজার ইনঅ্যাক্টিভ, সিরিয়াল স্কিপ করা হলো।`
          )
          const nextToiletTurn =
            group.current_toilet_turn >= group.total_members
              ? 1
              : group.current_toilet_turn + 1
          await supabase
            .from('groups')
            .update({ current_toilet_turn: nextToiletTurn })
            .eq('id', group.id)
        }
      } else {
        console.log(
          `⏳ টয়লেটের সময় এখনো হয়নি (৭ দিন পার হয়নি)। স্কিপ করা হলো।`
        )
      }
    }

    // ==========================================
    // 🧹 ডাটাবেজ ক্লিনিং: ৩০ দিনের পুরোনো টাস্ক ডিলিট করা
    // ==========================================
    console.log('🧹 ডাটাবেজ ক্লিনিং শুরু হচ্ছে (৩০ দিনের পুরোনো টাস্ক)...')

    // আজ থেকে ৩০ দিন আগের তারিখ বের করা
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    const { error: deleteError, count } = await supabase
      .from('tasks')
      .delete({ count: 'exact' })
      .lt('due_date', thirtyDaysAgoStr)

    if (deleteError) {
      console.error(
        '❌ পুরোনো টাস্ক ডিলিট করতে সমস্যা হয়েছে:',
        deleteError.message
      )
    } else {
      console.log(
        `✅ ক্লিনিং শেষ! ${count || 0} টি পুরোনো টাস্ক ডিলিট করা হয়েছে।`
      )
    }



    console.log(`\nসর্বমোট নতুন টাস্ক তৈরি হয়েছে: ${totalTasksCreated} টি`)
    console.log('-----------------------------------')

    return NextResponse.json({
      success: true,
      tasksCreated: totalTasksCreated,
      message: 'Auto-assigned tasks execution finished.',
    })
  } catch (error) {
    console.error('Cron Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while assigning tasks.' },
      { status: 500 }
    )
  }
}