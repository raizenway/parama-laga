"use client"
import Button from "@/app/components/button/button"
import Activity from "@/app/components/table/activity"

export default function Page(){
    return (
    <div className="mt-12 mx-8 h-screen flex-wrap space-y-5">
        <div className=" space-y-5">
            <div className="font-poppins font-bold text-2xl">Activity</div>
            <Activity />
        </div>
    </div>
    )
}