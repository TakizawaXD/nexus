import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="flex flex-1 items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="flex justify-center">
                        <MessageSquare className="h-16 w-16 text-primary" />
                    </div>
                    <CardTitle className="mt-4 text-2xl">Chat en Tiempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Esta funcionalidad está en construcción. ¡Vuelve pronto para chatear con tus amigos!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
