import { Shield, Fingerprint, Clock, Lock, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Fingerprint,
    title: "HWID Licensing",
    description: "Hardware-locked licenses ensure your software is only used on authorized devices.",
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "Firebase-powered auth with email verification and role-based access control.",
  },
  {
    icon: Clock,
    title: "Real-Time Monitoring",
    description: "Live dashboard with instant updates, expiry countdowns, and status tracking.",
  },
  {
    icon: Lock,
    title: "Server-Side Validation",
    description: "All critical operations are validated server-side. No client-side bypasses.",
  },
  {
    icon: Zap,
    title: "Instant Activation",
    description: "Licenses activate immediately after purchase with automated HWID registration.",
  },
  {
    icon: Users,
    title: "Admin Panel",
    description: "Full management suite for admins and moderators with granular controls.",
  },
];

export function LandingFeatures() {
  return (
    <section id="features" className="relative py-24 px-4 lg:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground text-balance sm:text-4xl">
            Built for Security
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground text-pretty leading-relaxed">
            Every feature is designed with security-first principles, from
            hardware-locked licenses to server-side validation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="glass-glow rounded-xl p-6 group animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-all group-hover:ring-primary/40">
                <feature.icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
