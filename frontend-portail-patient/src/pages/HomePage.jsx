import { Link } from 'react-router-dom';
import { Eye, Shield, Clock, Star, ChevronRight, CheckCircle } from 'lucide-react';

const features = [
  { icon: Clock, title: 'Réservation en 2 minutes', desc: 'Choisissez un créneau parmi les disponibilités en temps réel.' },
  { icon: Shield, title: 'Données sécurisées', desc: 'Vos informations médicales sont protégées et confidentielles.' },
  { icon: Star, title: 'Praticiens certifiés', desc: 'Tous nos ophtalmologues sont diplômés et expérimentés.' },
];

const stats = [
  { value: '10 000+', label: 'Patients satisfaits' },
  { value: '50+', label: 'Spécialistes' },
  { value: '< 48h', label: 'Délai moyen' },
];

export default function HomePage() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#F0F5F4', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section style={{
        background: 'linear-gradient(135deg, #092C56 0%, #1a4a80 50%, #225688 100%)',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none'
        }}>
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: 600, height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(169,203,224,0.12) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-20%', left: '-10%',
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(169,203,224,0.08) 0%, transparent 70%)',
          }} />
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 2, height: 2,
              borderRadius: '50%',
              background: 'rgba(169,203,224,0.4)',
              top: `${20 + i * 15}%`,
              left: `${10 + i * 18}%`,
              animation: `floatSlow ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.5}s`,
            }} />
          ))}
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}>

          {/* Left: Text */}
          <div className="animate-fade-in-up">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(169,203,224,0.15)',
              border: '1px solid rgba(169,203,224,0.3)',
              borderRadius: 100,
              padding: '0.375rem 1rem',
              marginBottom: '2rem',
            }}>
              <Eye size={14} color="#A9CBE0" />
              <span style={{ color: '#A9CBE0', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Portail Patient Ophtalmologique
              </span>
            </div>

            <h1 style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              letterSpacing: '-0.02em',
            }}>
              Votre vision,{' '}
              <span style={{
                background: 'linear-gradient(90deg, #A9CBE0, #F0F5F4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                notre priorité
              </span>
            </h1>

            <p style={{
              fontSize: '1.125rem',
              color: 'rgba(169,203,224,0.85)',
              lineHeight: 1.7,
              marginBottom: '2.5rem',
              maxWidth: 460,
            }}>
              Prenez rendez-vous avec un ophtalmologue de confiance en quelques clics.
              Simple, rapide et sécurisé — à tout moment.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link
                to="/cabinets"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '1rem 2rem',
                  background: '#A9CBE0',
                  color: '#092C56',
                  borderRadius: 16,
                  fontWeight: 700,
                  fontSize: '1rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 8px 24px rgba(169,203,224,0.35)',
                }}
                onMouseEnter={e => { e.target.style.background = '#F0F5F4'; e.target.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.target.style.background = '#A9CBE0'; e.target.style.transform = 'none'; }}
              >
                Prendre rendez-vous
                <ChevronRight size={18} />
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              {stats.map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#A9CBE0', fontFamily: "'DM Sans', sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(169,203,224,0.6)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="animate-fade-in-up animation-delay-300" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{
              width: 420, height: 420,
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Outer ring */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: '1px solid rgba(169,203,224,0.15)',
                animation: 'floatSlow 8s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', inset: 40,
                borderRadius: '50%',
                border: '1px solid rgba(169,203,224,0.1)',
                animation: 'floatSlow 6s ease-in-out infinite reverse',
              }} />
              {/* Center card */}
              <div style={{
                width: 280, height: 280,
                borderRadius: '50%',
                background: 'radial-gradient(circle at 40% 40%, rgba(169,203,224,0.2) 0%, rgba(9,44,86,0.6) 100%)',
                border: '1px solid rgba(169,203,224,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 24px 80px rgba(9,44,86,0.5), inset 0 1px 0 rgba(169,203,224,0.2)',
                animation: 'floatSlow 5s ease-in-out infinite',
              }}>
                <Eye size={96} color="rgba(169,203,224,0.8)" strokeWidth={1} />
              </div>

              {/* Floating badges */}
              {[
                { text: 'Disponible 24/7', icon: '🟢', top: '5%', left: '-10%' },
                { text: 'Confirmé par email', icon: '✉️', bottom: '10%', right: '-15%' },
                { text: 'Sans avance de frais', icon: '💳', top: '45%', right: '-20%' },
              ].map(b => (
                <div key={b.text} style={{
                  position: 'absolute', ...(b.top ? {top:b.top}:{}), ...(b.bottom ? {bottom:b.bottom}:{}),
                  ...(b.left ? {left:b.left}:{}), ...(b.right ? {right:b.right}:{}),
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(169,203,224,0.2)',
                  borderRadius: 12,
                  padding: '0.5rem 0.875rem',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  whiteSpace: 'nowrap',
                }}>
                  <span style={{ fontSize: 14 }}>{b.icon}</span>
                  <span style={{ color: 'rgba(240,245,244,0.9)', fontSize: '0.75rem', fontWeight: 500 }}>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '5rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }} className="animate-fade-in-up">
          <p style={{ color: '#225688', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Pourquoi nous choisir
          </p>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#092C56', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Une expérience patient repensée
          </h2>
          <p style={{ color: '#668CA9', maxWidth: 520, margin: '0 auto', lineHeight: 1.7, fontSize: '1rem' }}>
            Nous avons conçu chaque étape pour que votre parcours soit fluide, clair et rassurant.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <div key={f.title} className={`animate-fade-in-up animation-delay-${(i + 2) * 100}`} style={{
              background: 'white',
              borderRadius: 20,
              padding: '2rem',
              border: '1px solid rgba(169,203,224,0.3)',
              boxShadow: '0 4px 24px rgba(9,44,86,0.05)',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(9,44,86,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(9,44,86,0.05)'; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, #092C56, #225688)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 4px 12px rgba(34,86,136,0.25)',
              }}>
                <f.icon size={24} color="#A9CBE0" />
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#092C56', marginBottom: '0.5rem', fontSize: '1.0625rem' }}>
                {f.title}
              </h3>
              <p style={{ color: '#668CA9', fontSize: '0.9rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ background: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <p style={{ color: '#225688', fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Processus simple
            </p>
            <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 700, color: '#092C56', letterSpacing: '-0.02em' }}>
              3 étapes, c'est tout
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { num: '01', title: 'Choisissez un cabinet', desc: 'Parcourez notre réseau de cabinets ophtalmologiques.' },
              { num: '02', title: 'Sélectionnez un médecin', desc: 'Consultez les disponibilités et choisissez votre spécialiste.' },
              { num: '03', title: 'Confirmez votre RDV', desc: 'Recevez une confirmation immédiate par email avec un lien de gestion.' },
            ].map((step, i) => (
              <div key={step.num} style={{ position: 'relative', textAlign: 'center', padding: '0 1rem' }}>
                <div style={{
                  width: 64, height: 64,
                  borderRadius: '50%',
                  background: '#F0F5F4',
                  border: '2px solid #A9CBE0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '1.25rem', fontWeight: 700,
                  color: '#225688',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, color: '#092C56', marginBottom: '0.5rem', fontSize: '1rem' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#668CA9', fontSize: '0.875rem', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background: 'linear-gradient(135deg, #092C56 0%, #225688 100%)',
        padding: '5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'rgba(169,203,224,0.15)',
            border: '1px solid rgba(169,203,224,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
          }}>
            <CheckCircle size={28} color="#A9CBE0" />
          </div>

          <h2 style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: 'white',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            Prêt à prendre soin de votre vision ?
          </h2>
          <p style={{ color: 'rgba(169,203,224,0.8)', marginBottom: '2.5rem', fontSize: '1.0625rem', lineHeight: 1.7 }}>
            Rejoignez des milliers de patients qui font confiance à notre portail pour gérer leurs rendez-vous ophtalmologiques.
          </p>

          <Link
            to="/cabinets"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
              padding: '1rem 2.5rem',
              background: '#A9CBE0',
              color: '#092C56',
              borderRadius: 16,
              fontWeight: 700,
              fontSize: '1.0625rem',
              textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(169,203,224,0.3)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.target.style.background = '#F0F5F4'; e.target.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.target.style.background = '#A9CBE0'; e.target.style.transform = 'none'; }}
          >
            Trouver un cabinet
            <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#092C56', padding: '2.5rem 2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: 'rgba(169,203,224,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Eye size={18} color="#A9CBE0" />
          </div>
          <span style={{ fontFamily: "'DM Sans', sans-serif", color: 'white', fontWeight: 700, fontSize: '1rem' }}>
            Portail Patient
          </span>
        </div>
        <p style={{ color: 'rgba(169,203,224,0.5)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} — Prise de rendez-vous ophtalmologique. Tous droits réservés.
        </p>
      </footer>

      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @media (max-width: 768px) {
          section > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}