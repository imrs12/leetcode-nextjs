import { onBoardUser } from "@/modules/auth/actions";


export default async function Home() {

  await onBoardUser()
  return (
    <div className="flex justify-center items-center h-screen">
      
    </div>
  );
}
