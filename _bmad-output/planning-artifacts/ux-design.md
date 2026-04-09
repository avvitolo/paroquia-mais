<!-- Design System -->
<!DOCTYPE html>

<html lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Paróquia+ Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Work+Sans:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-fixed": "#001b3c",
                    "primary-fixed": "#d6e3ff",
                    "surface-variant": "#e0e3e5",
                    "surface-container": "#ebeef0",
                    "surface-tint": "#455f88",
                    "primary-container": "#1a365d",
                    "surface-container-low": "#f1f4f6",
                    "on-primary-container": "#86a0cd",
                    "on-primary": "#ffffff",
                    "on-secondary-fixed-variant": "#574500",
                    "on-tertiary-fixed": "#0d1c2e",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#28374a",
                    "tertiary": "#122234",
                    "primary-fixed-dim": "#adc7f7",
                    "on-error": "#ffffff",
                    "on-tertiary-container": "#91a0b7",
                    "outline-variant": "#c4c6cf",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed-variant": "#2d476f",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f7fafc",
                    "surface": "#f7fafc",
                    "tertiary-fixed-dim": "#b8c8e0",
                    "inverse-surface": "#2d3133",
                    "error-container": "#ffdad6",
                    "surface-dim": "#d7dadc",
                    "outline": "#74777f",
                    "inverse-on-surface": "#eef1f3",
                    "tertiary-fixed": "#d4e4fc",
                    "secondary-container": "#fed65b",
                    "on-surface": "#181c1e",
                    "secondary-fixed": "#ffe088",
                    "secondary-fixed-dim": "#e9c349",
                    "secondary": "#735c00",
                    "inverse-primary": "#adc7f7",
                    "surface-container-high": "#e5e9eb",
                    "surface-container-highest": "#e0e3e5",
                    "on-secondary-container": "#745c00",
                    "on-surface-variant": "#43474e",
                    "background": "#f7fafc",
                    "on-secondary-fixed": "#241a00",
                    "primary": "#002045",
                    "error": "#ba1a1a",
                    "on-tertiary-fixed-variant": "#39485c",
                    "on-tertiary": "#ffffff",
                    "on-background": "#181c1e"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Work Sans"],
                    "label": ["Work Sans"]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Work Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
        }
        h1, h2, h3 {
            font-family: 'Manrope', sans-serif;
        }
        .bg-sacred-gradient {
            background: linear-gradient(135deg, #002045 0%, #1a365d 100%);
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen pb-24">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="church">church</span>
<span class="text-xl font-bold bg-gradient-to-br from-[#002045] to-[#1a365d] bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400 font-['Manrope'] tracking-tight">Paróquia+</span>
</div>
<button class="p-2 rounded-full hover:bg-[#f1f4f6] dark:hover:bg-slate-800 transition-colors active:scale-95 duration-200">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="notifications">notifications</span>
</button>
</header>
<main class="pt-20 px-6 max-w-lg mx-auto">
<!-- Welcome Section -->
<section class="mt-4 mb-8">
<h1 class="text-3xl font-extrabold tracking-tight text-primary leading-tight">Welcome, Father John!</h1>
<p class="text-on-surface-variant font-body mt-1 opacity-80">Que sua jornada hoje seja abençoada.</p>
</section>
<!-- Bento Stats Grid -->
<div class="grid grid-cols-2 gap-4 mb-8">
<div class="bg-surface-container-low p-5 rounded-full flex flex-col justify-between aspect-square">
<div class="flex justify-between items-start">
<span class="material-symbols-outlined text-primary text-3xl" data-icon="group">group</span>
</div>
<div>
<div class="text-3xl font-bold text-primary font-headline">1.2k</div>
<div class="text-xs uppercase tracking-widest text-on-surface-variant font-label">Members</div>
</div>
</div>
<div class="bg-secondary-container p-5 rounded-full flex flex-col justify-between aspect-square">
<div class="flex justify-between items-start">
<span class="material-symbols-outlined text-on-secondary-container text-3xl" data-icon="calendar_month">calendar_month</span>
</div>
<div>
<div class="text-3xl font-bold text-on-secondary-container font-headline">12</div>
<div class="text-xs uppercase tracking-widest text-on-secondary-container font-label opacity-80">This Week</div>
</div>
</div>
</div>
<!-- Next Celebration Card -->
<section class="mb-8">
<div class="flex justify-between items-end mb-4">
<h2 class="text-xl font-bold font-headline tracking-wide">Next Celebration</h2>
<span class="text-xs font-semibold text-primary/60 font-label">View Schedule</span>
</div>
<div class="relative overflow-hidden rounded-full bg-sacred-gradient text-white p-8 shadow-2xl">
<div class="absolute top-0 right-0 p-4 opacity-10">
<span class="material-symbols-outlined text-[120px]" data-icon="auto_awesome">auto_awesome</span>
</div>
<div class="relative z-10">
<div class="flex items-center gap-2 mb-4">
<span class="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold tracking-widest uppercase">Sunday Mass</span>
</div>
<h3 class="text-2xl font-bold mb-1">Missa Solene</h3>
<div class="flex items-center gap-4 text-white/80 text-sm mb-6 font-body">
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-sm" data-icon="event">event</span>
                            Oct 22
                        </div>
<div class="flex items-center gap-1">
<span class="material-symbols-outlined text-sm" data-icon="schedule">schedule</span>
                            10:00 AM
                        </div>
</div>
<div class="space-y-2">
<div class="flex justify-between items-center text-xs font-label">
<span class="opacity-80">Scale Status</span>
<span class="font-bold">85% Confirmed</span>
</div>
<div class="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
<div class="h-full bg-secondary-fixed rounded-full w-[85%] shadow-[0_0_8px_#ffe088]"></div>
</div>
</div>
</div>
</div>
</section>
<!-- Recent Activities / Notifications -->
<section class="mb-8">
<h2 class="text-xl font-bold font-headline tracking-wide mb-4">Recent Activities</h2>
<div class="space-y-4">
<!-- Activity Item -->
<div class="flex items-center gap-4 p-1">
<div class="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-on-surface-variant" data-icon="person_add">person_add</span>
</div>
<div class="flex-grow border-b border-outline-variant/15 pb-4">
<div class="flex justify-between items-start">
<p class="text-sm font-semibold font-body">Novo batismo registrado</p>
<span class="text-[10px] text-on-surface-variant font-label">2h ago</span>
</div>
<p class="text-xs text-on-surface-variant font-body mt-0.5">Família Souza - Capela São Judas</p>
</div>
</div>
<!-- Activity Item -->
<div class="flex items-center gap-4 p-1">
<div class="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-on-primary-fixed" data-icon="volunteer_activism">volunteer_activism</span>
</div>
<div class="flex-grow border-b border-outline-variant/15 pb-4">
<div class="flex justify-between items-start">
<p class="text-sm font-semibold font-body">Donation received</p>
<span class="text-[10px] text-on-surface-variant font-label">5h ago</span>
</div>
<p class="text-xs text-on-surface-variant font-body mt-0.5">R$ 450,00 - Youth Ministry Fund</p>
</div>
</div>
<!-- Activity Item -->
<div class="flex items-center gap-4 p-1">
<div class="w-12 h-12 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-on-error-container" data-icon="report">report</span>
</div>
<div class="flex-grow border-b border-outline-variant/15 pb-4">
<div class="flex justify-between items-start">
<p class="text-sm font-semibold font-body">Scale replacement needed</p>
<span class="text-[10px] text-on-surface-variant font-label">Yesterday</span>
</div>
<p class="text-xs text-on-surface-variant font-body mt-0.5">Ministro indisponível para domingo</p>
</div>
</div>
</div>
</section>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md rounded-t-[0.75rem] border-t border-[#c4c6cf]/15 shadow-[0_-8px_32px_rgba(0,0,0,0.05)]">
<a class="flex flex-col items-center justify-center bg-[#d6e3ff] dark:bg-[#001b3c] text-[#001b3c] dark:text-[#d6e3ff] rounded-[0.75rem] px-5 py-1.5 transition-transform duration-300" href="#">
<span class="material-symbols-outlined" data-icon="dashboard" style="font-variation-settings: 'FILL' 1;">dashboard</span>
<span class="font-['Work_Sans'] text-xs font-medium">Início</span>
</a>
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300" href="#">
<span class="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
<span class="font-['Work_Sans'] text-xs font-medium">Agenda</span>
</a>
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300" href="#">
<span class="material-symbols-outlined" data-icon="group">group</span>
<span class="font-['Work_Sans'] text-xs font-medium">Membros</span>
</a>
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-['Work_Sans'] text-xs font-medium">Ajustes</span>
</a>
</nav>
</body></html>

<!-- Dashboard -->
<!DOCTYPE html>

<html lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Work+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-fixed": "#001b3c",
                    "primary-fixed": "#d6e3ff",
                    "surface-variant": "#e0e3e5",
                    "surface-container": "#ebeef0",
                    "surface-container-low": "#f1f4f6",
                    "surface-tint": "#455f88",
                    "primary-container": "#1a365d",
                    "on-primary-container": "#86a0cd",
                    "on-primary": "#ffffff",
                    "on-secondary-fixed-variant": "#574500",
                    "on-tertiary-fixed": "#0d1c2e",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#28374a",
                    "tertiary": "#122234",
                    "primary-fixed-dim": "#adc7f7",
                    "on-error": "#ffffff",
                    "on-tertiary-container": "#91a0b7",
                    "outline-variant": "#c4c6cf",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed-variant": "#2d476f",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f7fafc",
                    "surface": "#f7fafc",
                    "tertiary-fixed-dim": "#b8c8e0",
                    "inverse-surface": "#2d3133",
                    "error-container": "#ffdad6",
                    "surface-dim": "#d7dadc",
                    "outline": "#74777f",
                    "inverse-on-surface": "#eef1f3",
                    "tertiary-fixed": "#d4e4fc",
                    "secondary-container": "#fed65b",
                    "on-surface": "#181c1e",
                    "secondary-fixed": "#ffe088",
                    "secondary-fixed-dim": "#e9c349",
                    "secondary": "#735c00",
                    "inverse-primary": "#adc7f7",
                    "surface-container-high": "#e5e9eb",
                    "surface-container-highest": "#e0e3e5",
                    "on-secondary-container": "#745c00",
                    "on-surface-variant": "#43474e",
                    "background": "#f7fafc",
                    "on-secondary-fixed": "#241a00",
                    "primary": "#002045",
                    "error": "#ba1a1a",
                    "on-tertiary-fixed-variant": "#39485c",
                    "on-tertiary": "#ffffff",
                    "on-background": "#181c1e"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Work Sans"],
                    "label": ["Work Sans"]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body { font-family: 'Work Sans', sans-serif; }
        h1, h2, h3 { font-family: 'Manrope', sans-serif; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface min-h-screen pb-32">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="church">church</span>
<h1 class="text-xl font-bold bg-gradient-to-br from-[#002045] to-[#1a365d] bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400 font-['Manrope'] tracking-tight font-semibold">Paróquia+</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f1f4f6] dark:hover:bg-slate-800 transition-colors text-[#1A365D] dark:text-blue-200 duration-200 active:scale-95">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
</header>
<main class="pt-20 px-6">
<!-- Calendar Section -->
<section class="mt-4 mb-8">
<div class="flex items-center justify-between mb-6">
<h2 class="text-2xl font-extrabold tracking-tight text-primary">Agenda Litúrgica</h2>
<div class="flex gap-2">
<span class="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-wider">Outubro</span>
</div>
</div>
<!-- Horizontal Calendar Picker -->
<div class="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
<div class="flex flex-col items-center justify-center min-w-[64px] h-24 rounded-full bg-surface-container-low text-on-surface-variant transition-all">
<span class="text-xs font-medium opacity-70">SEG</span>
<span class="text-xl font-bold">21</span>
</div>
<div class="flex flex-col items-center justify-center min-w-[64px] h-24 rounded-full bg-surface-container-low text-on-surface-variant transition-all">
<span class="text-xs font-medium opacity-70">TER</span>
<span class="text-xl font-bold">22</span>
</div>
<div class="flex flex-col items-center justify-center min-w-[64px] h-24 rounded-full bg-primary text-on-primary shadow-lg ring-4 ring-primary-fixed/30 transition-all">
<span class="text-xs font-medium">QUA</span>
<span class="text-xl font-bold">23</span>
</div>
<div class="flex flex-col items-center justify-center min-w-[64px] h-24 rounded-full bg-surface-container-low text-on-surface-variant transition-all">
<span class="text-xs font-medium opacity-70">QUI</span>
<span class="text-xl font-bold">24</span>
</div>
<div class="flex flex-col items-center justify-center min-w-[64px] h-24 rounded-full bg-surface-container-low text-on-surface-variant transition-all">
<span class="text-xs font-medium opacity-70">SEX</span>
<span class="text-xl font-bold">25</span>
</div>
</div>
</section>
<!-- Celebrations List -->
<div class="space-y-6">
<!-- Header for Selected Day -->
<div class="flex items-baseline gap-2">
<h3 class="text-lg font-bold text-primary">Hoje, 23 de Outubro</h3>
<span class="text-sm text-on-surface-variant font-medium">3 celebrações</span>
</div>
<!-- Celebration Card 1 -->
<div class="bg-surface-container-lowest p-6 rounded-full shadow-sm border-l-4 border-primary">
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-1">Missa Diária</p>
<h4 class="text-xl font-bold text-primary">Celebração Matinal</h4>
</div>
<div class="flex flex-col items-end">
<span class="text-lg font-black text-primary">07:00</span>
<span class="text-[10px] text-on-surface-variant font-semibold">CAPELA</span>
</div>
</div>
<!-- Roles Grid -->
<div class="grid grid-cols-1 gap-3">
<div class="flex items-center justify-between p-3 bg-surface-container-low rounded-full">
<div class="flex items-center gap-3">
<img class="w-8 h-8 rounded-full object-cover" data-alt="Portrait of a middle-aged man with a friendly smile wearing a casual shirt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsHzp8E9ZAqQxMpJl6jAJLXH26KGC45fkmGUufkcahkP6vC13k6tfRwqrmEus6ocZ2hh7iJ_hXe5x8BcOFKIXzjTHvG9gIibIntZbyTkTRy5HvLTNQc6-km5y1lHBkdz9edsXoygTjPz2Dkc_ZctyjP2hiqS-rTvF-SzJ276OIgknwo4rG5a9e4tCYYX98aDm8iylUM22bxW9sIOzrG-nFbugHANUEYFeKXUsGfxZXSSCZO6n6uAN6D1KLBS-KL5z5NJ35dpjkF9A"/>
<div>
<p class="text-xs font-bold text-primary">Padre João Silva</p>
<p class="text-[10px] text-on-surface-variant uppercase">Celebrante</p>
</div>
</div>
<span class="material-symbols-outlined text-primary text-lg" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
<div class="flex items-center justify-between p-3 bg-surface-container-low rounded-full">
<div class="flex items-center gap-3">
<img class="w-8 h-8 rounded-full object-cover" data-alt="Close up of a young woman with curly hair smiling warmly at the camera" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb0ufn8fXw-fYGoLsa4Rptq_Tlkjn8_e2pSver4HRx1bob18_Nl-DSIDHE32K8l1zGenv2J3a9jbiAYmMYE8yHUndYKTKZLxs_mIMX_5bJkiKlHwDIDWK4U2SYBbswbs2pRJnNr8YAAVopfEZ6tRQNKeqEz-EEuRv5A27F3AuQUQzpvYiJnMKTaz4RpJ1ndd15F_A9xNN_C07GwgccC0D9rgIQ0wcER6NZraLuZez1jv67X7Jamcua361LzdxgD9NRIfFymQ1A8vU"/>
<div>
<p class="text-xs font-bold text-primary">Maria Oliveira</p>
<p class="text-[10px] text-on-surface-variant uppercase">Leitora</p>
</div>
</div>
<span class="material-symbols-outlined text-primary text-lg" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
</div>
</div>
<!-- Celebration Card 2 -->
<div class="bg-surface-container-lowest p-6 rounded-full shadow-sm border-l-4 border-secondary-container">
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-xs font-bold text-on-secondary-container uppercase tracking-widest mb-1">Adoração</p>
<h4 class="text-xl font-bold text-primary">Santíssimo Sacramento</h4>
</div>
<div class="flex flex-col items-end">
<span class="text-lg font-black text-primary">18:30</span>
<span class="text-[10px] text-on-surface-variant font-semibold">MATRIZ</span>
</div>
</div>
<div class="grid grid-cols-1 gap-3">
<div class="flex items-center justify-between p-3 bg-surface-container-low rounded-full">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant text-sm" data-icon="person">person</span>
</div>
<div>
<p class="text-xs font-bold text-on-surface-variant italic">Aguardando definição</p>
<p class="text-[10px] text-on-surface-variant uppercase">Ministro</p>
</div>
</div>
<span class="material-symbols-outlined text-on-surface-variant text-lg" data-icon="hourglass_empty">hourglass_empty</span>
</div>
</div>
</div>
<!-- Celebration Card 3 -->
<div class="bg-surface-container-lowest p-6 rounded-full shadow-sm border-l-4 border-primary">
<div class="flex justify-between items-start mb-4">
<div>
<p class="text-xs font-bold text-on-primary-container uppercase tracking-widest mb-1">Missa de Quarta</p>
<h4 class="text-xl font-bold text-primary">Missa com as Famílias</h4>
</div>
<div class="flex flex-col items-end">
<span class="text-lg font-black text-primary">20:00</span>
<span class="text-[10px] text-on-surface-variant font-semibold">MATRIZ</span>
</div>
</div>
<div class="grid grid-cols-1 gap-3">
<div class="flex items-center justify-between p-3 bg-surface-container-low rounded-full">
<div class="flex items-center gap-3">
<img class="w-8 h-8 rounded-full object-cover" data-alt="Portrait of a young man with a slight beard looking directly at the camera" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj6CdnJW8Vs9ExcoRolV67untC7VpMvG_ICtDlhzJQ9mME6xGvQL5aAo9Dv_TYN_smx5W1I0r1f8AdnfuUWXECxFkvy_hN8Uoxwe-8OhqbLDroKNCJ9dCLXqhX8KZhCaR_H9gcJo8KjY1Eu_pgihUtc5FEXHfhwN_lcWl3aOULgqVWuudSCFcQvAl6uJ2sawsoppi5GX_yz7zdvyZS5SMrTaihLKEqo1M0n6htmhliMpk93zGAFnZ5RDe7pkanpKC3g8MM7LpSP0I"/>
<div>
<p class="text-xs font-bold text-primary">Lucas Mendes</p>
<p class="text-[10px] text-on-surface-variant uppercase">Acólito</p>
</div>
</div>
<span class="material-symbols-outlined text-primary text-lg" data-icon="check_circle" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
</div>
</div>
</div>
</main>
<!-- FAB: Floating Action Button -->
<button class="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-full shadow-xl flex items-center justify-center z-40 active:scale-90 transition-transform duration-300">
<span class="material-symbols-outlined text-3xl" data-icon="add">add</span>
</button>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md rounded-t-[0.75rem] border-t border-[#c4c6cf]/15 shadow-[0_-8px_32px_rgba(0,0,0,0.05)]">
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 transition-transform duration-300 scale-90 hover:text-[#1A365D]" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="font-['Work_Sans'] text-xs font-medium">Início</span>
</a>
<a class="flex flex-col items-center justify-center bg-[#d6e3ff] dark:bg-[#001b3c] text-[#001b3c] dark:text-[#d6e3ff] rounded-[0.75rem] px-5 py-1.5 transition-transform duration-300 scale-90" href="#">
<span class="material-symbols-outlined" data-icon="calendar_month" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
<span class="font-['Work_Sans'] text-xs font-medium">Agenda</span>
</a>
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 transition-transform duration-300 scale-90 hover:text-[#1A365D]" href="#">
<span class="material-symbols-outlined" data-icon="group">group</span>
<span class="font-['Work_Sans'] text-xs font-medium">Membros</span>
</a>
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 transition-transform duration-300 scale-90 hover:text-[#1A365D]" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-['Work_Sans'] text-xs font-medium">Ajustes</span>
</a>
</nav>
<style>
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
    </style>
</body></html>

<!-- Gestão de Escalas -->
<!DOCTYPE html>

<html lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Work+Sans:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-fixed": "#001b3c",
                    "primary-fixed": "#d6e3ff",
                    "surface-variant": "#e0e3e5",
                    "surface-container": "#ebeef0",
                    "surface-tint": "#455f88",
                    "primary-container": "#1a365d",
                    "surface-container-low": "#f1f4f6",
                    "on-primary-container": "#86a0cd",
                    "on-primary": "#ffffff",
                    "on-secondary-fixed-variant": "#574500",
                    "on-tertiary-fixed": "#0d1c2e",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#28374a",
                    "tertiary": "#122234",
                    "primary-fixed-dim": "#adc7f7",
                    "on-error": "#ffffff",
                    "on-tertiary-container": "#91a0b7",
                    "outline-variant": "#c4c6cf",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed-variant": "#2d476f",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f7fafc",
                    "surface": "#f7fafc",
                    "tertiary-fixed-dim": "#b8c8e0",
                    "inverse-surface": "#2d3133",
                    "error-container": "#ffdad6",
                    "surface-dim": "#d7dadc",
                    "outline": "#74777f",
                    "inverse-on-surface": "#eef1f3",
                    "tertiary-fixed": "#d4e4fc",
                    "secondary-container": "#fed65b",
                    "on-surface": "#181c1e",
                    "secondary-fixed": "#ffe088",
                    "secondary-fixed-dim": "#e9c349",
                    "secondary": "#735c00",
                    "inverse-primary": "#adc7f7",
                    "surface-container-high": "#e5e9eb",
                    "surface-container-highest": "#e0e3e5",
                    "on-secondary-container": "#745c00",
                    "on-surface-variant": "#43474e",
                    "background": "#f7fafc",
                    "on-secondary-fixed": "#241a00",
                    "primary": "#002045",
                    "error": "#ba1a1a",
                    "on-tertiary-fixed-variant": "#39485c",
                    "on-tertiary": "#ffffff",
                    "on-background": "#181c1e"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Work Sans"],
                    "label": ["Work Sans"]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Work Sans', sans-serif;
            -webkit-tap-highlight-color: transparent;
        }
        h1, h2, h3 {
            font-family: 'Manrope', sans-serif;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface min-h-screen pb-24">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="church">church</span>
<h1 class="text-xl font-bold bg-gradient-to-br from-[#002045] to-[#1a365d] bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400 font-['Manrope'] tracking-tight">Paróquia+</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f1f4f6] dark:hover:bg-slate-800 transition-colors">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="notifications">notifications</span>
</button>
</header>
<main class="pt-20 px-6 max-w-lg mx-auto">
<!-- Editorial Header Section -->
<div class="mt-4 mb-8">
<h2 class="text-3xl font-extrabold text-primary tracking-tight mb-2">Membros</h2>
<p class="text-on-surface-variant text-body-lg leading-relaxed">Gerencie a comunidade e as pastorais em um só lugar.</p>
</div>
<!-- Search Bar -->
<div class="relative mb-8">
<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-outline" data-icon="search">search</span>
</div>
<input class="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-full text-on-surface placeholder-on-surface-variant focus:ring-2 focus:ring-primary-fixed-dim transition-all" placeholder="Buscar por nome ou pastoral..." type="text"/>
</div>
<!-- Filter Chips (Asymmetric Layout) -->
<div class="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
<span class="bg-primary-container text-on-primary px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Todos</span>
<span class="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Liturgia</span>
<span class="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Música</span>
<span class="bg-surface-container-highest text-on-surface-variant px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">Catequese</span>
</div>
<!-- Members Grid (Bento Style/Intentional Nesting) -->
<div class="space-y-4">
<!-- Member Card 1 -->
<div class="bg-surface-container-lowest p-5 rounded-full shadow-sm flex items-center gap-4 group transition-all active:scale-95 border border-outline-variant/10">
<div class="relative">
<img alt="Avatar" class="w-14 h-14 rounded-full object-cover" data-alt="Professional studio portrait of a middle-aged man with a warm smile, soft directional lighting, neutral grey background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMI5CAxqRBkd_3r0teK3EFxQqGgLwV7PdLCmMt23OUkJ31Qe_-B77po4wS8AriVJL0AKtTNLrTT9qzQUibs1GE9D9FdN8NFKkeQGwbmJ5lfWClnZDuQatduDYE5Kas_h5oke83avzq--bx1f7q3ZMLHLF1_txWKEBqDa8e_n4EZP-Cs5z2llcwQUPFnnrJ8XXjfypJ9Eq0gIl6hRdWh24nv2qPo3ViIS3iqfc_YbeqPrLDULlRBk0kRrLFXOjerE8Btn5q4BnatwM"/>
<div class="absolute bottom-0 right-0 w-4 h-4 bg-secondary-fixed border-2 border-surface-container-lowest rounded-full"></div>
</div>
<div class="flex-grow">
<h3 class="font-bold text-on-surface text-lg leading-tight">Ricardo Santos</h3>
<div class="flex gap-2 mt-1 flex-wrap">
<span class="text-[10px] uppercase tracking-wider font-bold text-primary-fixed-dim bg-primary-container px-2 py-0.5 rounded-full">Liturgia</span>
<span class="text-[10px] uppercase tracking-wider font-bold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-full">Música</span>
</div>
</div>
<span class="material-symbols-outlined text-outline-variant" data-icon="chevron_right">chevron_right</span>
</div>
<!-- Member Card 2 -->
<div class="bg-surface-container-lowest p-5 rounded-full shadow-sm flex items-center gap-4 transition-all active:scale-95 border border-outline-variant/10">
<div class="relative">
<img alt="Avatar" class="w-14 h-14 rounded-full object-cover" data-alt="Candid outdoor portrait of a young woman laughing, natural sunlight, soft green foliage background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbpqmy6ufApr36d1hngbCOBqmoIGFtAt1HCMN2dIVfwcxkBI9VKX62eR9_P_PtAp8uaAuDXt1Qn5JJHrL_rcUkWlMybX96qkVJvX8tZSx2nr97j5QmZ6EZv-_MJFq7JfqN4ToIFlGejqaMYoalW9D3ES4iFCGk6nhgU_BVYEXzKZkCBX6201dubN26JggQ2Hppr1vkc_OSbXhED1fUV_FoZynH6ThUbUG4AsSI26WpZ-sqyqhdZk6ksDp3HaqaXlrw8Bn3oUS1PI8"/>
</div>
<div class="flex-grow">
<h3 class="font-bold text-on-surface text-lg leading-tight">Ana Clara Pereira</h3>
<div class="flex gap-2 mt-1">
<span class="text-[10px] uppercase tracking-wider font-bold text-primary-fixed-dim bg-primary-container px-2 py-0.5 rounded-full">Catequese</span>
</div>
</div>
<span class="material-symbols-outlined text-outline-variant" data-icon="chevron_right">chevron_right</span>
</div>
<!-- Simplified Profile Context (Active State Visualization) -->
<div class="bg-surface-container-low p-6 rounded-[2rem] mt-8 border-none relative overflow-hidden">
<div class="absolute top-0 right-0 p-4">
<span class="material-symbols-outlined text-on-surface-variant/30 text-6xl" data-icon="format_quote">format_quote</span>
</div>
<div class="flex items-center gap-4 mb-6">
<img alt="Avatar" class="w-16 h-16 rounded-full object-cover border-4 border-surface-container-lowest" data-alt="Modern close-up of a young man with glasses, neutral expression, soft indoor lighting, minimalist aesthetic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt36cfN2Jfs_XY28_9nI7i7edekIuDG8qaGofcMMTBEXWyU8R_I7eO4uNl3jPQux3JD5-2CbpsIGLQ1iWXLFZpvwRr4YQk8EGFFfT-ugRwCNFocI3hycuMd3jAzU30YsXfvzAJmiTv_wEXe93EZRU02XKDkfdi8RobL2_uywoUlaV6t9u3Ie_8YiJSe2AxslMvqLkdO-qCxxObMaXrvBSxCOjAZ7SLRK1Y-W3NYGXpX5GLEnPTZqiU7k0LwOyQ8QLE1lYYC9W4r0A"/>
<div>
<h3 class="text-xl font-extrabold text-primary">Lucas Mendes</h3>
<p class="text-sm text-on-surface-variant">Membro desde Out 2022</p>
</div>
</div>
<div class="space-y-4">
<div class="bg-surface-container-lowest p-4 rounded-xl">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-secondary text-sm" data-icon="event_available">event_available</span>
<span class="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Disponibilidade</span>
</div>
<p class="text-sm text-on-surface leading-relaxed italic">"Disponível para as missas de Sábado à noite e Domingo de manhã. Prefere atuar na Liturgia da Palavra."</p>
</div>
<div class="flex justify-between items-center bg-primary-fixed p-4 rounded-full">
<span class="text-on-primary-fixed font-semibold text-sm px-2">Entrar em contato</span>
<div class="flex gap-2">
<button class="w-10 h-10 bg-on-primary-fixed text-on-primary rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-sm" data-icon="mail">mail</span>
</button>
<button class="w-10 h-10 bg-on-primary-fixed text-on-primary rounded-full flex items-center justify-center">
<span class="material-symbols-outlined text-sm" data-icon="call">call</span>
</button>
</div>
</div>
</div>
</div>
<!-- Member Card 4 -->
<div class="bg-surface-container-lowest p-5 rounded-full shadow-sm flex items-center gap-4 transition-all active:scale-95 border border-outline-variant/10">
<div class="relative">
<img alt="Avatar" class="w-14 h-14 rounded-full object-cover" data-alt="Portrait of an older woman with silver hair, kind eyes, soft warm sunset light, outdoor garden setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhIFQTMZN9R3UMQQ69Xz3f3YySf4vcr-VKyPpn12ayX9gHyUpWg9V_r7kz6aT3_l4yvh_TNu-z_abnb8y9oKEZZnCmrCFsAo0BxFRK8FGrTRr5Niq3sSf4kH7z4GFh7A8PfeOiCKHTk9ldwaTfquqzvsv7AOFK1ktMUlgJJvVihR5MLLB7Vjiq3z2-Uf0wHL6S3Tm5Pk6EgYNP8yg1iuTlUCihz4THPu3ydYuIWMSDngJ6EPwaIdeiJMDeaNcWJAgDTJWehyADNIQ"/>
</div>
<div class="flex-grow">
<h3 class="font-bold text-on-surface text-lg leading-tight">Dona Maria Augusta</h3>
<div class="flex gap-2 mt-1">
<span class="text-[10px] uppercase tracking-wider font-bold text-primary-fixed-dim bg-primary-container px-2 py-0.5 rounded-full">Eventos</span>
<span class="text-[10px] uppercase tracking-wider font-bold text-on-tertiary-container bg-tertiary-container px-2 py-0.5 rounded-full">Acolhida</span>
</div>
</div>
<span class="material-symbols-outlined text-outline-variant" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md border-t border-[#c4c6cf]/15 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] rounded-t-[0.75rem]">
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300 scale-90" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="font-['Work_Sans'] text-xs font-medium">Início</span>
</a>
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300 scale-90" href="#">
<span class="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
<span class="font-['Work_Sans'] text-xs font-medium">Agenda</span>
</a>
<a class="flex flex-col items-center justify-center bg-[#d6e3ff] dark:bg-[#001b3c] text-[#001b3c] dark:text-[#d6e3ff] rounded-[0.75rem] px-5 py-1.5 transition-transform duration-300 scale-90" href="#">
<span class="material-symbols-outlined" data-icon="group" style="font-variation-settings: 'FILL' 1;">group</span>
<span class="font-['Work_Sans'] text-xs font-medium">Membros</span>
</a>
<a class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300 scale-90" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-['Work_Sans'] text-xs font-medium">Ajustes</span>
</a>
</nav>
<!-- FAB for adding member (Contextual) -->
<div class="fixed bottom-24 right-6 z-40">
<button class="w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-[1rem] shadow-xl flex items-center justify-center text-on-primary transition-transform active:scale-90">
<span class="material-symbols-outlined" data-icon="person_add">person_add</span>
</button>
</div>
</body></html>

<!-- Membros e Disponibilidade -->
<!DOCTYPE html>

<html class="light" lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Ajustes - Paróquia+</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Work+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-fixed": "#001b3c",
                    "primary-fixed": "#d6e3ff",
                    "surface-variant": "#e0e3e5",
                    "surface-container": "#ebeef0",
                    "surface-tint": "#455f88",
                    "primary-container": "#1a365d",
                    "surface-container-low": "#f1f4f6",
                    "on-primary-container": "#86a0cd",
                    "on-primary": "#ffffff",
                    "on-secondary-fixed-variant": "#574500",
                    "on-tertiary-fixed": "#0d1c2e",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#28374a",
                    "tertiary": "#122234",
                    "primary-fixed-dim": "#adc7f7",
                    "on-error": "#ffffff",
                    "on-tertiary-container": "#91a0b7",
                    "outline-variant": "#c4c6cf",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed-variant": "#2d476f",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f7fafc",
                    "surface": "#f7fafc",
                    "tertiary-fixed-dim": "#b8c8e0",
                    "inverse-surface": "#2d3133",
                    "error-container": "#ffdad6",
                    "surface-dim": "#d7dadc",
                    "outline": "#74777f",
                    "inverse-on-surface": "#eef1f3",
                    "tertiary-fixed": "#d4e4fc",
                    "secondary-container": "#fed65b",
                    "on-surface": "#181c1e",
                    "secondary-fixed": "#ffe088",
                    "secondary-fixed-dim": "#e9c349",
                    "secondary": "#735c00",
                    "inverse-primary": "#adc7f7",
                    "surface-container-high": "#e5e9eb",
                    "surface-container-highest": "#e0e3e5",
                    "on-secondary-container": "#745c00",
                    "on-surface-variant": "#43474e",
                    "background": "#f7fafc",
                    "on-secondary-fixed": "#241a00",
                    "primary": "#002045",
                    "error": "#ba1a1a",
                    "on-tertiary-fixed-variant": "#39485c",
                    "on-tertiary": "#ffffff",
                    "on-background": "#181c1e"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Work Sans"],
                    "label": ["Work Sans"]
            }
          },
        },
      }
    </script>
<style>
        body { font-family: 'Work Sans', sans-serif; background-color: #f7fafc; color: #181c1e; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background min-h-screen pb-32">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md no-border tonal-shift flat no shadows">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="church">church</span>
<h1 class="text-xl font-bold bg-gradient-to-br from-[#002045] to-[#1a365d] bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400 font-['Manrope'] tracking-tight font-semibold">Paróquia+</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f1f4f6] dark:hover:bg-slate-800 transition-colors text-[#43474e] dark:text-slate-400">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
</header>
<main class="pt-24 px-6 max-w-lg mx-auto">
<!-- Page Title -->
<div class="mb-8">
<h2 class="text-3xl font-headline font-extrabold text-primary tracking-tight">Ajustes</h2>
<p class="text-on-surface-variant text-sm mt-1">Gerencie sua paróquia e preferências.</p>
</div>
<!-- Section: Parish Profile Profile -->
<section class="mb-10">
<div class="bg-surface-container-lowest rounded-full p-6 shadow-[0_8px_32px_rgba(0,0,0,0.03)] relative overflow-hidden">
<div class="flex items-center gap-5">
<div class="relative w-20 h-20 rounded-full border-4 border-surface-container overflow-hidden shrink-0">
<img alt="Parish Icon" class="w-full h-full object-cover" data-alt="Modern minimalist architectural detail of a white contemporary church with blue sky in the background, clean lines and soft lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxFyPZPgUNzrG049cx2LnIoQyEytMhIb9UNxeIOpmioYyTw5AQGT-RSMqkxElJ-Bo8hKqvC8_32u_oo-v_uTjAB_UHG2wa47e625p-1WcXoTy9jedfrgZyeiIIMH8RtpjRHsBc5bLBypuXJQ8j2I9QvXRBzINzkigzNOiarPlsarw7IahtcbQguqnqpjqLwmwDQuZPfwQmoIrAZy2GUSq1l0eNu7ZNpXEs2InJeTF9bigFx8zoGq-Tfz6zrUfFkoZFaoCow1r-uqc"/>
</div>
<div>
<h3 class="font-headline font-bold text-lg text-primary">Paróquia São Bento</h3>
<p class="text-on-surface-variant text-sm">Catedral Metropolitana</p>
<button class="mt-2 text-xs font-semibold text-primary-container bg-primary-fixed px-3 py-1 rounded-full hover:opacity-90 transition-opacity">
                            Editar Perfil
                        </button>
</div>
</div>
</div>
</section>
<!-- Section: Subscription (Bento Style) -->
<section class="mb-10">
<h4 class="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-4 ml-1">Assinatura &amp; Plano</h4>
<div class="grid grid-cols-2 gap-4">
<!-- Current Plan Card -->
<div class="col-span-2 bg-gradient-to-br from-primary to-primary-container p-6 rounded-full text-white shadow-xl">
<div class="flex justify-between items-start mb-4">
<div>
<span class="text-[10px] font-bold uppercase tracking-widest text-on-primary-container opacity-80">Plano Atual</span>
<h5 class="text-2xl font-headline font-extrabold">Plano Comunidade</h5>
</div>
<span class="material-symbols-outlined text-secondary-fixed" data-icon="verified" style="font-variation-settings: 'FILL' 1;">verified</span>
</div>
<div class="space-y-4">
<div class="w-full bg-white/10 h-2 rounded-full overflow-hidden">
<div aria-valuemax="50" aria-valuemin="0" aria-valuenow="45" class="bg-secondary-fixed h-full w-[90%]" role="progressbar"></div>
</div>
<div class="flex justify-between text-xs font-medium">
<span>45 de 50 membros utilizados</span>
<span class="text-secondary-fixed">90%</span>
</div>
</div>
</div>
<!-- Billing Button (Asymmetric) -->
<div class="col-span-1 bg-surface-container-low p-5 rounded-full flex flex-col justify-between hover:bg-surface-container-high transition-colors cursor-pointer group">
<span class="material-symbols-outlined text-primary mb-6 group-hover:scale-110 transition-transform" data-icon="payments">payments</span>
<span class="text-sm font-bold text-primary">Gerenciar Faturamento</span>
</div>
<!-- History Card -->
<div class="col-span-1 bg-surface-container-low p-5 rounded-full flex flex-col justify-between hover:bg-surface-container-high transition-colors cursor-pointer group">
<span class="material-symbols-outlined text-primary mb-6 group-hover:scale-110 transition-transform" data-icon="history_edu">history_edu</span>
<span class="text-sm font-bold text-primary">Histórico de Recibos</span>
</div>
</div>
</section>
<!-- Section: App Settings -->
<section class="mb-10">
<h4 class="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-4 ml-1">Geral</h4>
<div class="bg-surface-container-low rounded-full overflow-hidden">
<!-- Row: Notifications -->
<div class="flex items-center justify-between p-5 hover:bg-surface-container transition-colors cursor-pointer border-b border-outline-variant/15">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant" data-icon="notifications_active">notifications_active</span>
</div>
<div>
<span class="text-sm font-semibold block">Notificações</span>
<span class="text-xs text-on-surface-variant">Alertas de agenda e membros</span>
</div>
</div>
<div class="w-10 h-5 bg-primary rounded-full relative flex items-center px-1">
<div class="w-3 h-3 bg-white rounded-full translate-x-5"></div>
</div>
</div>
<!-- Row: Dark Mode -->
<div class="flex items-center justify-between p-5 hover:bg-surface-container transition-colors cursor-pointer border-b border-outline-variant/15">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant" data-icon="dark_mode">dark_mode</span>
</div>
<div>
<span class="text-sm font-semibold block">Modo Escuro</span>
<span class="text-xs text-on-surface-variant">Reduz a fadiga ocular</span>
</div>
</div>
<div class="w-10 h-5 bg-surface-container-highest rounded-full relative flex items-center px-1">
<div class="w-3 h-3 bg-white rounded-full"></div>
</div>
</div>
<!-- Row: Language -->
<div class="flex items-center justify-between p-5 hover:bg-surface-container transition-colors cursor-pointer">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant" data-icon="language">language</span>
</div>
<div>
<span class="text-sm font-semibold block">Idioma</span>
<span class="text-xs text-on-surface-variant">Português (Brasil)</span>
</div>
</div>
<span class="material-symbols-outlined text-outline" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</section>
<!-- Danger Zone -->
<section class="mb-10">
<button class="w-full flex items-center justify-center gap-3 p-5 rounded-full border border-error/20 text-error font-bold text-sm hover:bg-error-container/20 transition-colors">
<span class="material-symbols-outlined" data-icon="logout">logout</span>
                Sair da Conta
            </button>
<p class="text-center text-[10px] text-on-surface-variant mt-6 uppercase tracking-widest opacity-50">Paróquia+ v2.4.0 — 2024</p>
</section>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md border-t border-[#c4c6cf]/15 shadow-[0_-8px_32px_rgba(0,0,0,0.05)] rounded-t-[0.75rem]">
<div class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300 scale-90">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="font-['Work_Sans'] text-xs font-medium">Início</span>
</div>
<div class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300 scale-90">
<span class="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
<span class="font-['Work_Sans'] text-xs font-medium">Agenda</span>
</div>
<div class="flex flex-col items-center justify-center text-[#43474e] dark:text-slate-400 px-5 py-1.5 hover:text-[#1A365D] transition-transform duration-300 scale-90">
<span class="material-symbols-outlined" data-icon="group">group</span>
<span class="font-['Work_Sans'] text-xs font-medium">Membros</span>
</div>
<div class="flex flex-col items-center justify-center bg-[#d6e3ff] dark:bg-[#001b3c] text-[#001b3c] dark:text-[#d6e3ff] rounded-[0.75rem] px-5 py-1.5 transition-transform duration-300 scale-100">
<span class="material-symbols-outlined" data-icon="settings" style="font-variation-settings: 'FILL' 1;">settings</span>
<span class="font-['Work_Sans'] text-xs font-medium">Ajustes</span>
</div>
</nav>
</body></html>

<!-- Configurações -->
<!DOCTYPE html>

<html lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport"/>
<title>Paróquia+ Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Work+Sans:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-fixed": "#001b3c",
                    "primary-fixed": "#d6e3ff",
                    "surface-variant": "#e0e3e5",
                    "surface-container": "#ebeef0",
                    "surface-tint": "#455f88",
                    "primary-container": "#1a365d",
                    "surface-container-low": "#f1f4f6",
                    "on-primary-container": "#86a0cd",
                    "on-primary": "#ffffff",
                    "on-secondary-fixed-variant": "#574500",
                    "on-tertiary-fixed": "#0d1c2e",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#28374a",
                    "tertiary": "#122234",
                    "primary-fixed-dim": "#adc7f7",
                    "on-error": "#ffffff",
                    "on-tertiary-container": "#91a0b7",
                    "outline-variant": "#c4c6cf",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed-variant": "#2d476f",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f7fafc",
                    "surface": "#f7fafc",
                    "tertiary-fixed-dim": "#b8c8e0",
                    "inverse-surface": "#2d3133",
                    "error-container": "#ffdad6",
                    "surface-dim": "#d7dadc",
                    "outline": "#74777f",
                    "inverse-on-surface": "#eef1f3",
                    "tertiary-fixed": "#d4e4fc",
                    "secondary-container": "#fed65b",
                    "on-surface": "#181c1e",
                    "secondary-fixed": "#ffe088",
                    "secondary-fixed-dim": "#e9c349",
                    "secondary": "#735c00",
                    "inverse-primary": "#adc7f7",
                    "surface-container-high": "#e5e9eb",
                    "surface-container-highest": "#e0e3e5",
                    "on-secondary-container": "#745c00",
                    "on-surface-variant": "#43474e",
                    "background": "#f7fafc",
                    "on-secondary-fixed": "#241a00",
                    "primary": "#002045",
                    "error": "#ba1a1a",
                    "on-tertiary-fixed-variant": "#39485c",
                    "on-tertiary": "#ffffff",
                    "on-background": "#181c1e"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "1.5rem"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Work Sans"],
                    "label": ["Work Sans"]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Work Sans', sans-serif;
            -webkit-font-smoothing: antialiased;
            overscroll-behavior-y: contain;
        }
        h1, h2, h3 {
            font-family: 'Manrope', sans-serif;
        }
        .bg-sacred-gradient {
            background: linear-gradient(135deg, #002045 0%, #1a365d 100%);
        }
        .active-tab {
            font-variation-settings: 'FILL' 1;
        }
        /* Mobile-first touch enhancements */
        button, a {
            touch-action: manipulation;
        }
    </style>
</head>
<body class="bg-background text-on-background min-h-screen pb-28">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-5 py-4 w-full fixed top-0 z-50 bg-[#f7fafc]/90 backdrop-blur-xl border-b border-outline-variant/10">
<div class="flex items-center gap-2.5">
<div class="bg-primary-container p-2 rounded-xl flex items-center justify-center">
<span class="material-symbols-outlined text-primary-fixed text-xl" data-icon="church">church</span>
</div>
<span class="text-xl font-extrabold text-primary font-headline tracking-tight">Paróquia+</span>
</div>
<button aria-label="Notificações" class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-primary hover:bg-surface-container transition-all active:scale-90">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
</header>
<main class="pt-24 px-5 max-w-lg mx-auto">
<!-- Welcome Section -->
<section class="mb-8">
<h1 class="text-3xl font-extrabold tracking-tight text-primary leading-tight">Welcome, Father John!</h1>
<p class="text-on-surface-variant font-body mt-2 text-sm">Que sua jornada hoje seja abençoada.</p>
</section>
<!-- Bento Stats Grid - Refined Visual Hierarchy -->
<div class="grid grid-cols-2 gap-4 mb-8">
<div class="bg-surface-container-low p-6 rounded-full flex flex-col justify-between aspect-[1/1] border border-outline-variant/20 shadow-sm active:scale-95 transition-transform cursor-pointer">
<div class="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
<span class="material-symbols-outlined text-primary text-2xl" data-icon="group">group</span>
</div>
<div>
<div class="text-3xl font-extrabold text-primary font-headline">1.2k</div>
<div class="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant font-label opacity-70">Membros</div>
</div>
</div>
<div class="bg-secondary-container p-6 rounded-full flex flex-col justify-between aspect-[1/1] shadow-sm active:scale-95 transition-transform cursor-pointer">
<div class="w-10 h-10 rounded-full bg-secondary-fixed flex items-center justify-center">
<span class="material-symbols-outlined text-on-secondary-container text-2xl" data-icon="calendar_month">calendar_month</span>
</div>
<div>
<div class="text-3xl font-extrabold text-on-secondary-container font-headline">12</div>
<div class="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container font-label opacity-70">Esta Semana</div>
</div>
</div>
</div>
<!-- Next Celebration Card - Highly Legible & Actionable -->
<section class="mb-10">
<div class="flex justify-between items-center mb-4">
<h2 class="text-xl font-extrabold font-headline tracking-tight">Next Celebration</h2>
<button class="text-xs font-bold text-primary px-3 py-1 bg-primary/5 rounded-full font-label active:bg-primary/10">Ver Tudo</button>
</div>
<div class="relative overflow-hidden rounded-full bg-sacred-gradient text-white p-8 shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform">
<div class="absolute -top-10 -right-10 opacity-10">
<span class="material-symbols-outlined text-[180px]" data-icon="auto_awesome">auto_awesome</span>
</div>
<div class="relative z-10">
<div class="inline-flex items-center px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] font-extrabold tracking-widest uppercase mb-5 border border-white/10">
                        Sunday Mass
                    </div>
<h3 class="text-2xl font-extrabold mb-1 tracking-tight">Missa Solene</h3>
<div class="flex items-center gap-5 text-white/90 text-sm mb-8 font-body">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-base opacity-70" data-icon="event">event</span>
                            Oct 22
                        </div>
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-base opacity-70" data-icon="schedule">schedule</span>
                            10:00 AM
                        </div>
</div>
<div class="space-y-3">
<div class="flex justify-between items-center text-xs font-label">
<span class="opacity-80 font-medium">Status da Escala</span>
<span class="font-bold text-secondary-fixed">85% Confirmado</span>
</div>
<div class="h-2 w-full bg-white/10 rounded-full overflow-hidden">
<div class="h-full bg-secondary-fixed rounded-full w-[85%] shadow-[0_0_12px_#ffe088]"></div>
</div>
</div>
<button class="w-full mt-6 py-3.5 bg-white text-primary font-bold rounded-full text-sm shadow-lg active:bg-slate-100 transition-colors">
                        Gerenciar Escala
                    </button>
</div>
</div>
</section>
<!-- Recent Activities - Optimized Lists -->
<section class="mb-4">
<h2 class="text-xl font-extrabold font-headline tracking-tight mb-5">Recent Activities</h2>
<div class="space-y-2">
<!-- Activity Item -->
<button class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left active:bg-surface-container-low">
<div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-primary" data-icon="person_add">person_add</span>
</div>
<div class="flex-grow border-b border-outline-variant/10 pb-3">
<div class="flex justify-between items-start">
<p class="text-sm font-bold font-body text-on-surface">Novo batismo registrado</p>
<span class="text-[10px] text-on-surface-variant font-label font-medium">2h ago</span>
</div>
<p class="text-xs text-on-surface-variant font-body mt-0.5">Família Souza - Capela São Judas</p>
</div>
</button>
<!-- Activity Item -->
<button class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left active:bg-surface-container-low">
<div class="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-on-secondary-container" data-icon="volunteer_activism">volunteer_activism</span>
</div>
<div class="flex-grow border-b border-outline-variant/10 pb-3">
<div class="flex justify-between items-start">
<p class="text-sm font-bold font-body text-on-surface">Donation received</p>
<span class="text-[10px] text-on-surface-variant font-label font-medium">5h ago</span>
</div>
<p class="text-xs text-on-surface-variant font-body mt-0.5">R$ 450,00 - Youth Ministry Fund</p>
</div>
</button>
<!-- Activity Item -->
<button class="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left active:bg-surface-container-low">
<div class="w-12 h-12 rounded-full bg-error-container flex items-center justify-center flex-shrink-0">
<span class="material-symbols-outlined text-on-error-container" data-icon="report">report</span>
</div>
<div class="flex-grow pb-3">
<div class="flex justify-between items-start">
<p class="text-sm font-bold font-body text-on-surface">Scale replacement needed</p>
<span class="text-[10px] text-on-surface-variant font-label font-medium">Yesterday</span>
</div>
<p class="text-xs text-on-surface-variant font-body mt-0.5">Ministro indisponível para domingo</p>
</div>
</button>
</div>
</section>
</main>
<!-- BottomNavBar - Enhanced App Feel -->
<nav class="fixed bottom-0 left-0 w-full z-50 px-5 pb-6 pt-2 bg-white/80 backdrop-blur-xl border-t border-outline-variant/15 flex justify-around items-center">
<a class="flex flex-col items-center justify-center text-primary bg-primary-fixed/50 rounded-full px-5 py-2 transition-all" href="#">
<span class="material-symbols-outlined active-tab" data-icon="dashboard">dashboard</span>
<span class="font-['Work_Sans'] text-[10px] font-bold mt-0.5">Início</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant/70 px-5 py-2 hover:text-primary transition-all active:scale-90" href="#">
<span class="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
<span class="font-['Work_Sans'] text-[10px] font-bold mt-0.5">Agenda</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant/70 px-5 py-2 hover:text-primary transition-all active:scale-90" href="#">
<span class="material-symbols-outlined" data-icon="group">group</span>
<span class="font-['Work_Sans'] text-[10px] font-bold mt-0.5">Membros</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant/70 px-5 py-2 hover:text-primary transition-all active:scale-90" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-['Work_Sans'] text-[10px] font-bold mt-0.5">Ajustes</span>
</a>
</nav>
</body></html>

<!-- Dashboard (Mobile Optimized) -->
<!DOCTYPE html>

<html lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Work+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-fixed": "#001b3c",
                    "primary-fixed": "#d6e3ff",
                    "surface-variant": "#e0e3e5",
                    "surface-container": "#ebeef0",
                    "surface-container-low": "#f1f4f6",
                    "surface-tint": "#455f88",
                    "primary-container": "#1a365d",
                    "on-primary-container": "#86a0cd",
                    "on-primary": "#ffffff",
                    "on-secondary-fixed-variant": "#574500",
                    "on-tertiary-fixed": "#0d1c2e",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#28374a",
                    "tertiary": "#122234",
                    "primary-fixed-dim": "#adc7f7",
                    "on-error": "#ffffff",
                    "on-tertiary-container": "#91a0b7",
                    "outline-variant": "#c4c6cf",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed-variant": "#2d476f",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f7fafc",
                    "surface": "#f7fafc",
                    "tertiary-fixed-dim": "#b8c8e0",
                    "inverse-surface": "#2d3133",
                    "error-container": "#ffdad6",
                    "surface-dim": "#d7dadc",
                    "outline": "#74777f",
                    "inverse-on-surface": "#eef1f3",
                    "tertiary-fixed": "#d4e4fc",
                    "secondary-container": "#fed65b",
                    "on-surface": "#181c1e",
                    "secondary-fixed": "#ffe088",
                    "secondary-fixed-dim": "#e9c349",
                    "secondary": "#735c00",
                    "inverse-primary": "#adc7f7",
                    "surface-container-high": "#e5e9eb",
                    "surface-container-highest": "#e0e3e5",
                    "on-secondary-container": "#745c00",
                    "on-surface-variant": "#43474e",
                    "background": "#f7fafc",
                    "on-secondary-fixed": "#241a00",
                    "primary": "#002045",
                    "error": "#ba1a1a",
                    "on-tertiary-fixed-variant": "#39485c",
                    "on-tertiary": "#ffffff",
                    "on-background": "#181c1e"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Work Sans"],
                    "label": ["Work Sans"]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body { font-family: 'Work Sans', sans-serif; }
        h1, h2, h3 { font-family: 'Manrope', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .date-card-active { box-shadow: 0 10px 25px -5px rgba(0, 32, 69, 0.3); }
    </style>
</head>
<body class="bg-surface text-on-surface min-h-screen pb-32">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-80 backdrop-blur-md">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="church">church</span>
<h1 class="text-xl font-bold bg-gradient-to-br from-[#002045] to-[#1a365d] bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400 font-['Manrope'] tracking-tight font-semibold">Paróquia+</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f1f4f6] dark:hover:bg-slate-800 transition-colors text-[#1A365D] dark:text-blue-200 duration-200 active:scale-95">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
</header>
<main class="pt-20 px-6">
<!-- Calendar Section - Optimized for Thumb Reach -->
<section class="mt-4 mb-8">
<div class="flex items-center justify-between mb-4">
<h2 class="text-2xl font-extrabold tracking-tight text-primary">Escalas</h2>
<button class="flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold uppercase tracking-wider active:bg-secondary-fixed transition-colors">
<span>Outubro</span>
<span class="material-symbols-outlined text-sm" data-icon="expand_more">expand_more</span>
</button>
</div>
<!-- Horizontal Calendar Picker - Enhanced Sizing and Feedback -->
<div class="flex gap-3 overflow-x-auto pb-6 no-scrollbar -mx-6 px-6">
<button class="flex flex-col items-center justify-center min-w-[72px] h-20 rounded-2xl bg-surface-container-low text-on-surface-variant transition-all active:scale-95">
<span class="text-[10px] font-bold opacity-60 uppercase tracking-tighter">SEG</span>
<span class="text-xl font-bold">21</span>
</button>
<button class="flex flex-col items-center justify-center min-w-[72px] h-20 rounded-2xl bg-surface-container-low text-on-surface-variant transition-all active:scale-95">
<span class="text-[10px] font-bold opacity-60 uppercase tracking-tighter">TER</span>
<span class="text-xl font-bold">22</span>
</button>
<button class="flex flex-col items-center justify-center min-w-[72px] h-20 rounded-2xl bg-primary text-on-primary date-card-active transition-all active:scale-95 border-2 border-primary">
<span class="text-[10px] font-bold uppercase tracking-tighter">QUA</span>
<span class="text-xl font-bold">23</span>
<div class="w-1.5 h-1.5 bg-secondary-container rounded-full mt-1"></div>
</button>
<button class="flex flex-col items-center justify-center min-w-[72px] h-20 rounded-2xl bg-surface-container-low text-on-surface-variant transition-all active:scale-95">
<span class="text-[10px] font-bold opacity-60 uppercase tracking-tighter">QUI</span>
<span class="text-xl font-bold">24</span>
</button>
<button class="flex flex-col items-center justify-center min-w-[72px] h-20 rounded-2xl bg-surface-container-low text-on-surface-variant transition-all active:scale-95">
<span class="text-[10px] font-bold opacity-60 uppercase tracking-tighter">SEX</span>
<span class="text-xl font-bold">25</span>
</button>
</div>
</section>
<!-- Celebrations List -->
<div class="space-y-6">
<div class="flex items-baseline justify-between">
<h3 class="text-lg font-bold text-primary">Hoje, 23 de Outubro</h3>
<span class="text-xs text-on-surface-variant font-semibold uppercase tracking-wider bg-surface-container px-2 py-0.5 rounded">3 Atividades</span>
</div>
<!-- Celebration Card 1 - High Contrast & Interactive -->
<div class="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-sm border-l-8 border-primary transition-all active:bg-surface-container-low">
<div class="flex justify-between items-start mb-5">
<div>
<p class="text-[10px] font-extrabold text-primary/70 uppercase tracking-[0.15em] mb-1">Missa Diária</p>
<h4 class="text-xl font-bold text-primary leading-tight">Celebração Matinal</h4>
</div>
<div class="text-right">
<span class="text-xl font-black text-primary block">07:00</span>
<span class="text-[9px] text-on-surface-variant font-bold bg-surface-container px-1.5 py-0.5 rounded">CAPELA</span>
</div>
</div>
<div class="space-y-2.5">
<!-- Member Row: Confirmed State -->
<div class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl active:bg-surface-variant transition-colors border border-transparent active:border-primary/20">
<div class="flex items-center gap-3">
<div class="relative">
<img class="w-10 h-10 rounded-full object-cover ring-2 ring-white" data-alt="Portrait of a middle-aged man" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsHzp8E9ZAqQxMpJl6jAJLXH26KGC45fkmGUufkcahkP6vC13k6tfRwqrmEus6ocZ2hh7iJ_hXe5x8BcOFKIXzjTHvG9gIibIntZbyTkTRy5HvLTNQc6-km5y1lHBkdz9edsXoygTjPz2Dkc_ZctyjP2hiqS-rTvF-SzJ276OIgknwo4rG5a9e4tCYYX98aDm8iylUM22bxW9sIOzrG-nFbugHANUEYFeKXUsGfxZXSSCZO6n6uAN6D1KLBS-KL5z5NJ35dpjkF9A"/>
<div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
<span class="material-symbols-outlined text-[10px] font-bold" data-icon="check">check</span>
</div>
</div>
<div>
<p class="text-sm font-bold text-primary">Padre João Silva</p>
<p class="text-[9px] text-on-surface-variant font-bold uppercase">Celebrante</p>
</div>
</div>
<button class="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10">
<span class="material-symbols-outlined text-xl" data-icon="more_vert">more_vert</span>
</button>
</div>
<div class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl active:bg-surface-variant transition-colors border border-transparent active:border-primary/20">
<div class="flex items-center gap-3">
<div class="relative">
<img class="w-10 h-10 rounded-full object-cover ring-2 ring-white" data-alt="Close up of a young woman" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb0ufn8fXw-fYGoLsa4Rptq_Tlkjn8_e2pSver4HRx1bob18_Nl-DSIDHE32K8l1zGenv2J3a9jbiAYmMYE8yHUndYKTKZLxs_mIMX_5bJkiKlHwDIDWK4U2SYBbswbs2pRJnNr8YAAVopfEZ6tRQNKeqEz-EEuRv5A27F3AuQUQzpvYiJnMKTaz4RpJ1ndd15F_A9xNN_C07GwgccC0D9rgIQ0wcER6NZraLuZez1jv67X7Jamcua361LzdxgD9NRIfFymQ1A8vU"/>
<div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
<span class="material-symbols-outlined text-[10px] font-bold" data-icon="check">check</span>
</div>
</div>
<div>
<p class="text-sm font-bold text-primary">Maria Oliveira</p>
<p class="text-[9px] text-on-surface-variant font-bold uppercase">Leitora</p>
</div>
</div>
<button class="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10">
<span class="material-symbols-outlined text-xl" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>
</div>
<!-- Celebration Card 2 - Critical Confirmation Task -->
<div class="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-sm border-l-8 border-secondary-container transition-all">
<div class="flex justify-between items-start mb-5">
<div>
<p class="text-[10px] font-extrabold text-on-secondary-container uppercase tracking-[0.15em] mb-1">Adoração</p>
<h4 class="text-xl font-bold text-primary leading-tight">Santíssimo Sacramento</h4>
</div>
<div class="text-right">
<span class="text-xl font-black text-primary block">18:30</span>
<span class="text-[9px] text-on-surface-variant font-bold bg-surface-container px-1.5 py-0.5 rounded">MATRIZ</span>
</div>
</div>
<div class="p-4 bg-error-container/10 border-2 border-dashed border-secondary-container/40 rounded-xl">
<div class="flex items-center justify-between">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
<span class="material-symbols-outlined" data-icon="person_add">person_add</span>
</div>
<div>
<p class="text-sm font-bold text-on-surface-variant italic">Vaga em aberto</p>
<p class="text-[9px] text-on-surface-variant font-bold uppercase">Ministro</p>
</div>
</div>
<button class="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-bold text-xs uppercase shadow-sm active:scale-95 transition-transform">
                            Escalar
                        </button>
</div>
</div>
</div>
<!-- Celebration Card 3 -->
<div class="bg-surface-container-lowest p-5 rounded-[1.5rem] shadow-sm border-l-8 border-primary transition-all active:bg-surface-container-low">
<div class="flex justify-between items-start mb-5">
<div>
<p class="text-[10px] font-extrabold text-primary/70 uppercase tracking-[0.15em] mb-1">Missa de Quarta</p>
<h4 class="text-xl font-bold text-primary leading-tight">Missa com as Famílias</h4>
</div>
<div class="text-right">
<span class="text-xl font-black text-primary block">20:00</span>
<span class="text-[9px] text-on-surface-variant font-bold bg-surface-container px-1.5 py-0.5 rounded">MATRIZ</span>
</div>
</div>
<div class="flex items-center justify-between p-3 bg-surface-container-low rounded-xl active:bg-surface-variant transition-colors">
<div class="flex items-center gap-3">
<div class="relative">
<img class="w-10 h-10 rounded-full object-cover ring-2 ring-white" data-alt="Portrait of a young man" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDj6CdnJW8Vs9ExcoRolV67untC7VpMvG_ICtDlhzJQ9mME6xGvQL5aAo9Dv_TYN_smx5W1I0r1f8AdnfuUWXECxFkvy_hN8Uoxwe-8OhqbLDroKNCJ9dCLXqhX8KZhCaR_H9gcJo8KjY1Eu_pgihUtc5FEXHfhwN_lcWl3aOULgqVWuudSCFcQvAl6uJ2sawsoppi5GX_yz7zdvyZS5SMrTaihLKEqo1M0n6htmhliMpk93zGAFnZ5RDe7pkanpKC3g8MM7LpSP0I"/>
<div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white">
<span class="material-symbols-outlined text-[10px] font-bold" data-icon="check">check</span>
</div>
</div>
<div>
<p class="text-sm font-bold text-primary">Lucas Mendes</p>
<p class="text-[9px] text-on-surface-variant font-bold uppercase">Acólito</p>
</div>
</div>
<button class="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10">
<span class="material-symbols-outlined text-xl" data-icon="more_vert">more_vert</span>
</button>
</div>
</div>
</div>
</main>
<!-- FAB: Enhanced for Primary Action -->
<button class="fixed bottom-24 right-6 w-16 h-16 bg-primary text-on-primary rounded-2xl shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform duration-300 border-2 border-white/10 ring-4 ring-primary/10">
<span class="material-symbols-outlined text-4xl" data-icon="add">add</span>
</button>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-3 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-95 backdrop-blur-xl rounded-t-[2rem] border-t border-[#c4c6cf]/30 shadow-[0_-12px_40px_rgba(0,0,0,0.08)]">
<a class="flex flex-col items-center justify-center text-on-surface-variant dark:text-slate-400 px-4 py-1.5 transition-all active:scale-95 group" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:text-primary" data-icon="dashboard">dashboard</span>
<span class="font-['Work_Sans'] text-[10px] font-bold mt-1 uppercase tracking-tighter">Início</span>
</a>
<a class="flex flex-col items-center justify-center text-primary dark:text-primary-fixed-dim px-4 py-1.5 transition-all scale-110" href="#">
<span class="material-symbols-outlined text-[28px]" data-icon="calendar_month" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
<span class="font-['Work_Sans'] text-[10px] font-black mt-1 uppercase tracking-tighter">Agenda</span>
<div class="w-1 h-1 bg-primary rounded-full mt-0.5"></div>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant dark:text-slate-400 px-4 py-1.5 transition-all active:scale-95 group" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:text-primary" data-icon="group">group</span>
<span class="font-['Work_Sans'] text-[10px] font-bold mt-1 uppercase tracking-tighter">Membros</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant dark:text-slate-400 px-4 py-1.5 transition-all active:scale-95 group" href="#">
<span class="material-symbols-outlined text-[26px] group-hover:text-primary" data-icon="settings">settings</span>
<span class="font-['Work_Sans'] text-[10px] font-bold mt-1 uppercase tracking-tighter">Ajustes</span>
</a>
</nav>
</body></html>

<!-- Agenda (Mobile Optimized) -->
<!DOCTYPE html>

<html lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport"/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Work+Sans:wght@300;400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-fixed": "#001b3c",
                    "primary-fixed": "#d6e3ff",
                    "surface-variant": "#e0e3e5",
                    "surface-container": "#ebeef0",
                    "surface-tint": "#455f88",
                    "primary-container": "#1a365d",
                    "surface-container-low": "#f1f4f6",
                    "on-primary-container": "#86a0cd",
                    "on-primary": "#ffffff",
                    "on-secondary-fixed-variant": "#574500",
                    "on-tertiary-fixed": "#0d1c2e",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#28374a",
                    "tertiary": "#122234",
                    "primary-fixed-dim": "#adc7f7",
                    "on-error": "#ffffff",
                    "on-tertiary-container": "#91a0b7",
                    "outline-variant": "#c4c6cf",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed-variant": "#2d476f",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f7fafc",
                    "surface": "#f7fafc",
                    "tertiary-fixed-dim": "#b8c8e0",
                    "inverse-surface": "#2d3133",
                    "error-container": "#ffdad6",
                    "surface-dim": "#d7dadc",
                    "outline": "#74777f",
                    "inverse-on-surface": "#eef1f3",
                    "tertiary-fixed": "#d4e4fc",
                    "secondary-container": "#fed65b",
                    "on-surface": "#181c1e",
                    "secondary-fixed": "#ffe088",
                    "secondary-fixed-dim": "#e9c349",
                    "secondary": "#735c00",
                    "inverse-primary": "#adc7f7",
                    "surface-container-high": "#e5e9eb",
                    "surface-container-highest": "#e0e3e5",
                    "on-secondary-container": "#745c00",
                    "on-surface-variant": "#43474e",
                    "background": "#f7fafc",
                    "on-secondary-fixed": "#241a00",
                    "primary": "#002045",
                    "error": "#ba1a1a",
                    "on-tertiary-fixed-variant": "#39485c",
                    "on-tertiary": "#ffffff",
                    "on-background": "#181c1e"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Work Sans"],
                    "label": ["Work Sans"]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Work Sans', sans-serif;
            -webkit-tap-highlight-color: transparent;
            overscroll-behavior-y: contain;
        }
        h1, h2, h3 {
            font-family: 'Manrope', sans-serif;
        }
        .no-scrollbar::-webkit-scrollbar {
            display: none;
        }
        .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .safe-area-bottom {
            padding-bottom: env(safe-area-inset-bottom);
        }
    </style>
</head>
<body class="bg-surface text-on-surface min-h-screen">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 bg-[#f7fafc]/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-outline-variant/10">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="church">church</span>
<h1 class="text-xl font-extrabold bg-gradient-to-br from-[#002045] to-[#1a365d] bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400 font-['Manrope'] tracking-tight">Paróquia+</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container active:scale-95 transition-all">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="notifications">notifications</span>
</button>
</header>
<main class="pt-20 pb-32 px-4 max-w-lg mx-auto">
<!-- Editorial Header Section -->
<div class="mt-4 mb-6 px-2">
<h2 class="text-3xl font-extrabold text-primary tracking-tight mb-1">Membros</h2>
<p class="text-on-surface-variant text-base leading-snug">Gerencie a comunidade e as pastorais em um só lugar.</p>
</div>
<!-- Search and Filter Bar Sticky Group -->
<div class="sticky top-[72px] z-40 bg-surface/95 backdrop-blur-sm -mx-4 px-4 py-2 space-y-3">
<!-- Search Bar -->
<div class="relative group">
<div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
<span class="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors" data-icon="search">search</span>
</div>
<input class="w-full pl-12 pr-12 py-3.5 bg-surface-container-low border border-transparent rounded-2xl text-on-surface placeholder-on-surface-variant focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-primary/20 transition-all text-base shadow-sm" placeholder="Buscar por nome ou pastoral..." type="text"/>
<button class="absolute inset-y-0 right-4 flex items-center text-outline hover:text-primary">
<span class="material-symbols-outlined text-xl" data-icon="tune">tune</span>
</button>
</div>
<!-- Filter Chips -->
<div class="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
<button class="bg-primary text-on-primary px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shadow-sm shadow-primary/20 transition-transform active:scale-95">Todos</button>
<button class="bg-surface-container-highest text-on-surface-variant px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-surface-variant transition-transform active:scale-95 border border-outline-variant/10">Liturgia</button>
<button class="bg-surface-container-highest text-on-surface-variant px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-surface-variant transition-transform active:scale-95 border border-outline-variant/10">Música</button>
<button class="bg-surface-container-highest text-on-surface-variant px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap hover:bg-surface-variant transition-transform active:scale-95 border border-outline-variant/10">Catequese</button>
</div>
</div>
<!-- Members List -->
<div class="space-y-3 mt-4">
<!-- Member Card 1 -->
<div class="bg-surface-container-lowest p-4 rounded-2xl shadow-sm flex items-center gap-4 group transition-all active:bg-surface-container-low border border-outline-variant/10">
<div class="relative shrink-0">
<img alt="Avatar" class="w-14 h-14 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMI5CAxqRBkd_3r0teK3EFxQqGgLwV7PdLCmMt23OUkJ31Qe_-B77po4wS8AriVJL0AKtTNLrTT9qzQUibs1GE9D9FdN8NFKkeQGwbmJ5lfWClnZDuQatduDYE5Kas_h5oke83avzq--bx1f7q3ZMLHLF1_txWKEBqDa8e_n4EZP-Cs5z2llcwQUPFnnrJ8XXjfypJ9Eq0gIl6hRdWh24nv2qPo3ViIS3iqfc_YbeqPrLDULlRBk0kRrLFXOjerE8Btn5q4BnatwM"/>
<div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface-container-lowest rounded-full"></div>
</div>
<div class="flex-grow min-w-0">
<h3 class="font-bold text-on-surface text-base truncate">Ricardo Santos</h3>
<div class="flex gap-1.5 mt-1 flex-wrap">
<span class="text-[10px] uppercase tracking-wide font-bold text-primary-fixed-dim bg-primary-container px-2 py-0.5 rounded-md">Liturgia</span>
<span class="text-[10px] uppercase tracking-wide font-bold text-on-secondary-container bg-secondary-container px-2 py-0.5 rounded-md">Música</span>
</div>
</div>
<span class="material-symbols-outlined text-outline-variant group-active:translate-x-1 transition-transform" data-icon="chevron_right">chevron_right</span>
</div>
<!-- Member Card 2 -->
<div class="bg-surface-container-lowest p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-all active:bg-surface-container-low border border-outline-variant/10">
<div class="relative shrink-0">
<img alt="Avatar" class="w-14 h-14 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbpqmy6ufApr36d1hngbCOBqmoIGFtAt1HCMN2dIVfwcxkBI9VKX62eR9_P_PtAp8uaAuDXt1Qn5JJHrL_rcUkWlMybX96qkVJvX8tZSx2nr97j5QmZ6EZv-_MJFq7JfqN4ToIFlGejqaMYoalW9D3ES4iFCGk6nhgU_BVYEXzKZkCBX6201dubN26JggQ2Hppr1vkc_OSbXhED1fUV_FoZynH6ThUbUG4AsSI26WpZ-sqyqhdZk6ksDp3HaqaXlrw8Bn3oUS1PI8"/>
</div>
<div class="flex-grow min-w-0">
<h3 class="font-bold text-on-surface text-base truncate">Ana Clara Pereira</h3>
<div class="flex gap-1.5 mt-1">
<span class="text-[10px] uppercase tracking-wide font-bold text-primary-fixed-dim bg-primary-container px-2 py-0.5 rounded-md">Catequese</span>
</div>
</div>
<span class="material-symbols-outlined text-outline-variant" data-icon="chevron_right">chevron_right</span>
</div>
<!-- Detailed Profile Section (Expanded Context) -->
<div class="bg-primary-fixed/30 p-5 rounded-[2.5rem] mt-6 border border-primary-fixed-dim/20 relative overflow-hidden">
<div class="absolute -top-4 -right-4 opacity-10">
<span class="material-symbols-outlined text-[120px]" data-icon="person">person</span>
</div>
<div class="relative z-10">
<div class="flex items-center gap-4 mb-5">
<img alt="Avatar" class="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-lg" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt36cfN2Jfs_XY28_9nI7i7edekIuDG8qaGofcMMTBEXWyU8R_I7eO4uNl3jPQux3JD5-2CbpsIGLQ1iWXLFZpvwRr4YQk8EGFFfT-ugRwCNFocI3hycuMd3jAzU30YsXfvzAJmiTv_wEXe93EZRU02XKDkfdi8RobL2_uywoUlaV6t9u3Ie_8YiJSe2AxslMvqLkdO-qCxxObMaXrvBSxCOjAZ7SLRK1Y-W3NYGXpX5GLEnPTZqiU7k0LwOyQ8QLE1lYYC9W4r0A"/>
<div class="min-w-0">
<h3 class="text-xl font-extrabold text-primary truncate">Lucas Mendes</h3>
<p class="text-xs text-on-surface-variant font-medium">Membro desde Out 2022</p>
</div>
</div>
<div class="space-y-4">
<div class="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-secondary text-base" data-icon="event_available">event_available</span>
<span class="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Disponibilidade</span>
</div>
<p class="text-sm text-on-surface leading-relaxed italic">"Disponível para as missas de Sábado à noite e Domingo de manhã. Prefere atuar na Liturgia da Palavra."</p>
</div>
<div class="flex gap-3 mt-2">
<button class="flex-1 bg-primary text-on-primary h-14 rounded-2xl flex items-center justify-center gap-3 font-semibold shadow-md shadow-primary/20 active:scale-[0.98] transition-transform">
<span class="material-symbols-outlined text-xl" data-icon="call">call</span>
            Ligar
        </button>
<button class="w-14 h-14 bg-white text-primary border border-primary/10 rounded-2xl flex items-center justify-center shadow-sm active:scale-[0.98] transition-transform">
<span class="material-symbols-outlined text-xl" data-icon="mail">mail</span>
</button>
</div>
</div>
</div>
</div>
<!-- Member Card 4 -->
<div class="mt-3 bg-surface-container-lowest p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-all active:bg-surface-container-low border border-outline-variant/10">
<div class="relative shrink-0">
<img alt="Avatar" class="w-14 h-14 rounded-full object-cover shadow-sm" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhIFQTMZN9R3UMQQ69Xz3f3YySf4vcr-VKyPpn12ayX9gHyUpWg9V_r7kz6aT3_l4yvh_TNu-z_abnb8y9oKEZZnCmrCFsAo0BxFRK8FGrTRr5Niq3sSf4kH7z4GFh7A8PfeOiCKHTk9ldwaTfquqzvsv7AOFK1ktMUlgJJvVihR5MLLB7Vjiq3z2-Uf0wHL6S3Tm5Pk6EgYNP8yg1iuTlUCihz4THPu3ydYuIWMSDngJ6EPwaIdeiJMDeaNcWJAgDTJWehyADNIQ"/>
</div>
<div class="flex-grow min-w-0">
<h3 class="font-bold text-on-surface text-base truncate">Dona Maria Augusta</h3>
<div class="flex gap-1.5 mt-1">
<span class="text-[10px] uppercase tracking-wide font-bold text-primary-fixed-dim bg-primary-container px-2 py-0.5 rounded-md">Eventos</span>
<span class="text-[10px] uppercase tracking-wide font-bold text-on-tertiary-container bg-tertiary-container px-2 py-0.5 rounded-md">Acolhida</span>
</div>
</div>
<span class="material-symbols-outlined text-outline-variant" data-icon="chevron_right">chevron_right</span>
</div>
</div>
</main>
<!-- FAB for adding member (Floating and reachable) -->
<div class="fixed bottom-24 right-6 z-40">
<button class="w-16 h-16 bg-primary text-on-primary rounded-[1.5rem] shadow-2xl flex items-center justify-center transition-transform active:scale-90 ring-4 ring-surface">
<span class="material-symbols-outlined text-3xl font-bold" data-icon="person_add">person_add</span>
</button>
</div>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full z-50 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] rounded-t-[1.5rem] px-2 pb-safe safe-area-bottom">
<div class="flex justify-around items-center h-16 pt-1">
<a class="flex flex-col items-center justify-center text-on-surface-variant opacity-60 w-16" href="#">
<span class="material-symbols-outlined text-2xl" data-icon="dashboard">dashboard</span>
<span class="text-[10px] font-bold mt-1">Início</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant opacity-60 w-16" href="#">
<span class="material-symbols-outlined text-2xl" data-icon="calendar_month">calendar_month</span>
<span class="text-[10px] font-bold mt-1">Agenda</span>
</a>
<a class="flex flex-col items-center justify-center text-primary w-16 relative" href="#">
<div class="absolute -top-1 w-12 h-1 bg-primary rounded-full"></div>
<span class="material-symbols-outlined text-2xl" data-icon="group" style="font-variation-settings: 'FILL' 1;">group</span>
<span class="text-[10px] font-bold mt-1">Membros</span>
</a>
<a class="flex flex-col items-center justify-center text-on-surface-variant opacity-60 w-16" href="#">
<span class="material-symbols-outlined text-2xl" data-icon="settings">settings</span>
<span class="text-[10px] font-bold mt-1">Ajustes</span>
</a>
</div>
</nav>
</body></html>

<!-- Membros (Mobile Optimized) -->
<!DOCTYPE html>

<html class="light" lang="pt-BR"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Ajustes - Paróquia+</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&amp;family=Work+Sans:wght@400;500;600&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "on-primary-fixed": "#001b3c",
                    "primary-fixed": "#d6e3ff",
                    "surface-variant": "#e0e3e5",
                    "surface-container": "#ebeef0",
                    "surface-tint": "#455f88",
                    "primary-container": "#1a365d",
                    "surface-container-low": "#f1f4f6",
                    "on-primary-container": "#86a0cd",
                    "on-primary": "#ffffff",
                    "on-secondary-fixed-variant": "#574500",
                    "on-tertiary-fixed": "#0d1c2e",
                    "on-error-container": "#93000a",
                    "tertiary-container": "#28374a",
                    "tertiary": "#122234",
                    "primary-fixed-dim": "#adc7f7",
                    "on-error": "#ffffff",
                    "on-tertiary-container": "#91a0b7",
                    "outline-variant": "#c4c6cf",
                    "on-secondary": "#ffffff",
                    "on-primary-fixed-variant": "#2d476f",
                    "surface-container-lowest": "#ffffff",
                    "surface-bright": "#f7fafc",
                    "surface": "#f7fafc",
                    "tertiary-fixed-dim": "#b8c8e0",
                    "inverse-surface": "#2d3133",
                    "error-container": "#ffdad6",
                    "surface-dim": "#d7dadc",
                    "outline": "#74777f",
                    "inverse-on-surface": "#eef1f3",
                    "tertiary-fixed": "#d4e4fc",
                    "secondary-container": "#fed65b",
                    "on-surface": "#181c1e",
                    "secondary-fixed": "#ffe088",
                    "secondary-fixed-dim": "#e9c349",
                    "secondary": "#735c00",
                    "inverse-primary": "#adc7f7",
                    "surface-container-high": "#e5e9eb",
                    "surface-container-highest": "#e0e3e5",
                    "on-secondary-container": "#745c00",
                    "on-surface-variant": "#43474e",
                    "background": "#f7fafc",
                    "on-secondary-fixed": "#241a00",
                    "primary": "#002045",
                    "error": "#ba1a1a",
                    "on-tertiary-fixed-variant": "#39485c",
                    "on-tertiary": "#ffffff",
                    "on-background": "#181c1e"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Work Sans"],
                    "label": ["Work Sans"]
            }
          },
        },
      }
    </script>
<style>
        body { font-family: 'Work Sans', sans-serif; background-color: #f7fafc; color: #181c1e; -webkit-tap-highlight-color: transparent; }
        .font-headline { font-family: 'Manrope', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
    </style>
</head>
<body class="bg-background min-h-screen pb-32">
<!-- TopAppBar -->
<header class="flex justify-between items-center px-6 py-4 w-full fixed top-0 z-50 bg-[#f7fafc] dark:bg-slate-900 bg-opacity-90 backdrop-blur-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[#1A365D] dark:text-blue-200" data-icon="church">church</span>
<h1 class="text-xl font-bold bg-gradient-to-br from-[#002045] to-[#1a365d] bg-clip-text text-transparent dark:from-blue-200 dark:to-blue-400 font-headline tracking-tight">Paróquia+</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full active:bg-[#f1f4f6] dark:active:bg-slate-800 transition-colors text-[#43474e] dark:text-slate-400">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
</header>
<main class="pt-24 px-4 max-w-lg mx-auto">
<!-- Page Title -->
<div class="mb-6 px-2">
<h2 class="text-3xl font-headline font-extrabold text-primary tracking-tight">Ajustes</h2>
<p class="text-on-surface-variant text-sm mt-0.5">Gerencie sua paróquia e preferências.</p>
</div>
<!-- Section: Profile Card (Single Column List Style) -->
<section class="mb-8">
<div class="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high">
<div class="flex items-center gap-4">
<div class="relative w-16 h-16 rounded-xl border border-surface-container overflow-hidden shrink-0">
<img alt="Parish Icon" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxFyPZPgUNzrG049cx2LnIoQyEytMhIb9UNxeIOpmioYyTw5AQGT-RSMqkxElJ-Bo8hKqvC8_32u_oo-v_uTjAB_UHG2wa47e625p-1WcXoTy9jedfrgZyeiIIMH8RtpjRHsBc5bLBypuXJQ8j2I9QvXRBzINzkigzNOiarPlsarw7IahtcbQguqnqpjqLwmwDQuZPfwQmoIrAZy2GUSq1l0eNu7ZNpXEs2InJeTF9bigFx8zoGq-Tfz6zrUfFkoZFaoCow1r-uqc"/>
</div>
<div class="flex-1">
<h3 class="font-headline font-bold text-lg text-primary leading-tight">Paróquia São Bento</h3>
<p class="text-on-surface-variant text-xs">Catedral Metropolitana</p>
</div>
<button class="text-xs font-semibold text-primary bg-primary-fixed px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                        Editar
                    </button>
</div>
</div>
</section>
<!-- Section: Subscription (Grouped list style for mobile feel) -->
<section class="mb-8">
<h4 class="font-headline font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-3 ml-2">Assinatura &amp; Plano</h4>
<div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container-high divide-y divide-surface-container">
<!-- Highlighted Plan Item -->
<div class="p-5 bg-gradient-to-r from-primary to-[#1a365d] text-white">
<div class="flex justify-between items-start mb-3">
<div>
<span class="text-[10px] font-bold uppercase tracking-widest text-on-primary-container">Ativo</span>
<h5 class="text-xl font-headline font-extrabold leading-tight">Plano Comunidade</h5>
</div>
<span class="material-symbols-outlined text-secondary-fixed text-2xl" data-icon="verified" style="font-variation-settings: 'FILL' 1;">verified</span>
</div>
<div class="space-y-2">
<div class="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
<div class="bg-secondary-fixed h-full w-[90%]"></div>
</div>
<div class="flex justify-between text-[11px] font-medium opacity-90">
<span>45 de 50 membros</span>
<span class="text-secondary-fixed">90% utilizado</span>
</div>
</div>
</div>
<!-- Action Rows -->
<button class="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors text-left group">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary" data-icon="payments">payments</span>
<span class="text-sm font-semibold">Gerenciar Faturamento</span>
</div>
<span class="material-symbols-outlined text-outline text-sm" data-icon="chevron_right">chevron_right</span>
</button>
<button class="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors text-left group">
<div class="flex items-center gap-3">
<span class="material-symbols-outlined text-primary" data-icon="history_edu">history_edu</span>
<span class="text-sm font-semibold">Histórico de Recibos</span>
</div>
<span class="material-symbols-outlined text-outline text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</section>
<!-- Section: App Settings -->
<section class="mb-8">
<h4 class="font-headline font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-3 ml-2">Geral</h4>
<div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-surface-container-high divide-y divide-surface-container">
<!-- Notifications Toggle -->
<div class="flex items-center justify-between p-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant text-xl" data-icon="notifications_active">notifications_active</span>
</div>
<div>
<span class="text-sm font-semibold block leading-tight">Notificações</span>
<span class="text-[11px] text-on-surface-variant">Alertas de agenda e membros</span>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<!-- Dark Mode Toggle -->
<div class="flex items-center justify-between p-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant text-xl" data-icon="dark_mode">dark_mode</span>
</div>
<div>
<span class="text-sm font-semibold block leading-tight">Modo Escuro</span>
<span class="text-[11px] text-on-surface-variant">Reduz a fadiga ocular</span>
</div>
</div>
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
</label>
</div>
<!-- Language Selector -->
<button class="w-full flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors text-left group">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
<span class="material-symbols-outlined text-on-surface-variant text-xl" data-icon="language">language</span>
</div>
<div>
<span class="text-sm font-semibold block leading-tight">Idioma</span>
<span class="text-[11px] text-on-surface-variant">Português (Brasil)</span>
</div>
</div>
<span class="material-symbols-outlined text-outline text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</section>
<!-- Danger Zone -->
<section class="mb-12">
<button class="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-error-container/10 border border-error/20 text-error font-bold text-sm active:bg-error-container/20 transition-colors">
<span class="material-symbols-outlined text-xl" data-icon="logout">logout</span>
                Sair da Conta
            </button>
<p class="text-center text-[10px] text-on-surface-variant mt-6 uppercase tracking-[0.2em] font-medium opacity-40">Paróquia+ v2.4.0 — 2024</p>
</section>
</main>
<!-- BottomNavBar (Optimized Height and Padding) -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-5 pt-3 bg-surface/90 backdrop-blur-xl border-t border-outline-variant/15 shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
<button class="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 transition-all active:scale-90">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="text-[10px] font-semibold mt-0.5">Início</span>
</button>
<button class="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 transition-all active:scale-90">
<span class="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
<span class="text-[10px] font-semibold mt-0.5">Agenda</span>
</button>
<button class="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1.5 transition-all active:scale-90">
<span class="material-symbols-outlined" data-icon="group">group</span>
<span class="text-[10px] font-semibold mt-0.5">Membros</span>
</button>
<button class="flex flex-col items-center justify-center text-primary bg-primary-fixed/40 rounded-xl px-5 py-1.5 transition-all">
<span class="material-symbols-outlined" data-icon="settings" style="font-variation-settings: 'FILL' 1;">settings</span>
<span class="text-[10px] font-bold mt-0.5">Ajustes</span>
</button>
</nav>
