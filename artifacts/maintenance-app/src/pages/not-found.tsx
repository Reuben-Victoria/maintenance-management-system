import { Card, CardContent } from "@/components/ui/card";
import { IonIcon } from "@/components/ui/ion-icon";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4 border-border/50 shadow-lg">
        <CardContent className="pt-10 pb-10 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <IonIcon
              name="alert-circle-outline"
              style={{ fontSize: "36px", color: "hsl(var(--destructive))" }}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">404</h1>
            <p className="text-xl font-semibold text-foreground">Page Not Found</p>
            <p className="text-sm text-muted-foreground mt-2">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <Link href="/dashboard" className={buttonVariants({ className: "mt-2 gap-2" })}>
            <IonIcon name="home-outline" style={{ fontSize: "16px" }} />
            Back to Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
