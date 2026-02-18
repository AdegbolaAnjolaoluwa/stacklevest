"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function SessionGuard({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if ((session as any)?.error === "RefreshAccessTokenError") {
            console.warn("Session expired or refresh failed. Redirecting to login...");
            signOut({ callbackUrl: "/login" });
        }
    }, [session, router]);

    return <>{children}</>;
}
