
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const handleReset = () => {
    // Here you would implement the logic to reset the statistics.
    // For now, we'll just show a toast notification.
    toast({
      title: 'Estadísticas Reiniciadas',
      description: 'Tus estadísticas de práctica han sido borradas.',
    });
  };
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Perfil de Usuario</CardTitle>
          <CardDescription>
            Gestiona tu perfil y preferencias de la cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src="https://picsum.photos/seed/poker-user/100/100"
                data-ai-hint="profile avatar"
              />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                defaultValue="Usuario"
                className="max-w-xs"
              />
            </div>
          </div>
          <Button>Guardar Cambios</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">
            Personalización de la Práctica
          </CardTitle>
          <CardDescription>
            Ajusta la interfaz y el feedback a tu gusto.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="coach-mode" className="text-base">
                Modo Entrenador
              </Label>
              <p className="text-sm text-muted-foreground">
                Muestra explicaciones y GTO en tiempo real durante la práctica.
              </p>
            </div>
            <Switch id="coach-mode" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-type">Tipo de Feedback</Label>
            <Select defaultValue="detailed">
              <SelectTrigger id="feedback-type" className="max-w-xs">
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple (✅ / ❌)</SelectItem>
                <SelectItem value="detailed">
                  Detallado (con explicación)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold font-headline">Perfiles Múltiples</h3>
            <p className="text-sm text-muted-foreground">
              Crea perfiles para enseñar a otros o para practicar diferentes
              estilos. (Función en desarrollo)
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-2 rounded-md border bg-secondary p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src="https://picsum.photos/seed/poker-user/40/40"
                    data-ai-hint="profile avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span>Perfil Principal</span>
              </div>
              <Button variant="outline">Añadir Perfil</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-destructive">
            Zona de Peligro
          </CardTitle>
          <CardDescription>
            Acciones que no se pueden deshacer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Reiniciar Estadísticas</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  ¿Estás absolutamente seguro?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se borrarán
                  permanentemente todas tus estadísticas de práctica y tu
                  progreso.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset}>
                  Sí, reiniciar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
