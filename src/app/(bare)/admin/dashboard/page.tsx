import {cookies} from "next/headers";
import {redirect} from "next/navigation";
import Dashboard from "@/components/dashboard/Dashboard";
import ModelList from "@/components/model/model-list/ModelList";

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("admin")?.value;

    if (adminCookie !== "true") {
        redirect("/admin/login"); // серверний редірект ще до рендеру
    }

    return(
        <>
            <Dashboard/>
            <ModelList/>
        </>
    );
}
