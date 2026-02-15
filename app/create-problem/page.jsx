import { ModeToggle } from '@/components/ui/mode-toggle'
import { getUserRole } from '@/modules/auth/actions'
import CreateProblemForm from '@/modules/problems/components/create-problem-form'
import { Button } from '@base-ui/react'
import { currentUser } from '@clerk/nextjs/server'
import { UserRole } from '@prisma/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

const CreatePageProblem = async () => {

    const user = await currentUser()
    const userRole= await getUserRole()

    console.log("user ka role", userRole)

    if(userRole !== UserRole.ADMIN){
        return redirect('/')
    }
  return (
    <section className='flex flex-col items-center justify-center container mx-4 my-4'>
        <div className='flex flex-row justify-between items-center w-full'>
            <Link href="/">
                <Button variant={"otline"}>
                    <ArrowLeft className='size-4'/>
                </Button>
            </Link>

            <h1 className='text-3xl font-bold text-amber-400'>Welcome {user?.firstName}! Create a Problem</h1>
            <ModeToggle></ModeToggle>
        </div>

        <CreateProblemForm></CreateProblemForm>

    </section>
  )
}

export default CreatePageProblem