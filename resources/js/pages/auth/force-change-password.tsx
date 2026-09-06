import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { KeyRound, LoaderCircle, ShieldAlert } from 'lucide-react';
import { FormEventHandler } from 'react';

interface ForceChangePasswordProps {
    username: string;
    name: string;
}

type ForceChangePasswordForm = {
    password: string;
    password_confirmation: string;
};

export default function ForceChangePassword({ username, name }: ForceChangePasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ForceChangePasswordForm>({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.force-change.update'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout
            title="Perbarui Kata Sandi Perdana"
            description="Langkah keamanan wajib untuk akun baru Manggon"
        >
            <Head title="Ganti Kata Sandi Perdana" />

            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="flex items-start gap-3">
                    <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1">
                        <p className="font-medium">
                            Halo, <span className="font-semibold text-neutral-900 dark:text-white">{name}</span> (@{username})
                        </p>
                        <p className="text-xs leading-relaxed text-amber-750/90 dark:text-amber-300/80">
                            Sistem mendeteksi Anda masih menggunakan kata sandi acak. Demi privasi dan keamanan kos, silakan tentukan kata sandi baru pribadi Anda sebelum melanjutkan.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-2">
                    <Label htmlFor="password">Kata Sandi Baru</Label>
                    <div className="relative">
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="pr-10"
                            autoComplete="new-password"
                            autoFocus
                            placeholder="Minimal 8 karakter"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <KeyRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    </div>
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi Baru</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        autoComplete="new-password"
                        placeholder="Ulangi kata sandi baru"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Menyimpan Perubahan...
                        </>
                    ) : (
                        'Simpan & Lanjut ke Dashboard'
                    )}
                </Button>

                <div className="pt-2 text-center text-xs text-neutral-500">
                    Bukan akun Anda?{' '}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="font-medium text-neutral-900 underline hover:text-neutral-700 dark:text-neutral-200"
                    >
                        Keluar
                    </Link>
                </div>
            </form>
        </AuthLayout>
    );
}
