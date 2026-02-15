"use server";
import { prisma} from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export const onBoardUser = async () => {
  try {
    const user = await currentUser();

    if (!user) {
      return { success: false, error: "No authenticated user found" };
    }

    const { id, firstName, lastName, imageUrl, emailAddresses } = user;

    // Ensure Prisma Client is up to date with schema

    const newUser = await prisma.user.upsert({
      where: {
        clerkId: id,
      },
      update: {
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        email: emailAddresses[0]?.emailAddress || "",
      },
      create: {
        clerkId: id,
        firstName: firstName || null,
        lastName: lastName || null,
        imageUrl: imageUrl || null,
        email: emailAddresses[0]?.emailAddress || "",
      },
    });

    return {
        success:true,
        user:newUser,
        message:"User onBoarded Successfully"
    }
  } catch (error) {
      console.error("Error onboarding user:", error);
        return { 
            success: false, 
            error: "Failed to onboard user" 
        };
  }
};

export const getUserRole = async ()=>{
      try {
        const user = await currentUser()

        if(!user){
          return {
            success: false, error: "No authenticated user found"
          }
        }

        const {id} = user;

        const userRole = await prisma.user.findUnique({
          where: {
            clerkId: id
          },
          select: {
            role: true
          }
        })

        console.log(userRole)

        return userRole.role
      } catch (error) {
        console.error("❌ Error fetching user role:", error);
        return { success: false, error: "Failed to fetch user role" };
      }
}

export const getCurrentUser = async ()=>{
    const user = await currentUser()

    const dbUser = await prisma.user.findUnique({
      where: {
          clerkId: user.id
      },
      select: {
        id: true
      }
    })

    return dbUser
}
