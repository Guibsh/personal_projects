import tkinter as tk
from tkinter import ttk, messagebox
import datetime
import time
import winsound
import threading

class DespertadorApp:
    def __init__(self, master):
        self.master = master
        master.title("Assistente de Produtividade")
        master.geometry("400x600")
        master.configure(bg='#2c3e50')

        self.setup_styles()

        self.main_frame = tk.Frame(master, bg='#34495e', relief='ridge', borderwidth=10)
        self.main_frame.place(relx=0.5, rely=0.5, anchor='center', relwidth=0.95, relheight=0.95)

        self.title_label = tk.Label(self.main_frame, text="Assistente de Produtividade",
                                    font=('Helvetica', 16, 'bold'), bg='#34495e', fg='#ecf0f1')
        self.title_label.pack(pady=20)

        self.notebook = ttk.Notebook(self.main_frame)
        self.notebook.pack(expand=True, fill='both', padx=10, pady=10)

        self.alarme_frame = ttk.Frame(self.notebook, style='Custom.TFrame')
        self.cronometro_frame = ttk.Frame(self.notebook, style='Custom.TFrame')
        self.pomodoro_frame = ttk.Frame(self.notebook, style='Custom.TFrame')

        self.notebook.add(self.alarme_frame, text='Alarme')
        self.notebook.add(self.cronometro_frame, text='Cronômetro')
        self.notebook.add(self.pomodoro_frame, text='Pomodoro')

        self.setup_alarme()
        self.setup_cronometro()
        self.setup_pomodoro()

        self.footer = tk.Label(self.main_frame, text="Feito com ❤️ por Guilherme Magalhães Brites",
                               font=('Helvetica', 8), bg='#34495e', fg='#bdc3c7')
        self.footer.pack(side='bottom', pady=10)

    def setup_styles(self):
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.style.configure('TNotebook', background='#34495e', borderwidth=0)
        self.style.configure('TNotebook.Tab', background='#2c3e50', foreground='white',
                             padding=[20, 10], font=('Helvetica', 10, 'bold'))
        self.style.map('TNotebook.Tab', background=[('selected', '#3498db')])
        self.style.configure('Custom.TFrame', background='#ecf0f1')
        self.style.configure('TButton', font=('Helvetica', 10, 'bold'),
                             background='#3498db', foreground='white')
        self.style.map('TButton', background=[('active', '#2980b9')])
        self.style.configure('TLabel', font=('Helvetica', 12), background='#ecf0f1', foreground='#2c3e50')
        self.style.configure('TEntry', font=('Helvetica', 12), padding=10)

    def setup_alarme(self):
        ttk.Label(self.alarme_frame, text="Digite a hora do alarme (HH:MM):",
                  font=('Helvetica', 14, 'bold')).pack(pady=20)
        self.entrada_hora = ttk.Entry(self.alarme_frame, font=('Helvetica', 14), width=10)
        self.entrada_hora.pack(pady=10)

        self.alarme_ativo = False
        self.thread_alarme = None

        ttk.Button(self.alarme_frame, text="Definir Alarme", command=self.definir_alarme).pack(pady=10)
        self.botao_parar_alarme = ttk.Button(self.alarme_frame, text="Parar Alarme",
                                             command=self.parar_alarme, state=tk.DISABLED)
        self.botao_parar_alarme.pack(pady=10)
        ttk.Button(self.alarme_frame, text="Testar Som", command=self.testar_som).pack(pady=10)

    def setup_cronometro(self):
        self.tempo_cronometro = 0
        self.cronometro_ativo = False
        self.label_cronometro = ttk.Label(self.cronometro_frame, text="00:00:00",
                                          font=('Helvetica', 36, 'bold'))
        self.label_cronometro.pack(pady=30)
        ttk.Button(self.cronometro_frame, text="Iniciar/Parar", command=self.toggle_cronometro).pack(pady=10)
        ttk.Button(self.cronometro_frame, text="Resetar", command=self.resetar_cronometro).pack(pady=10)

    def setup_pomodoro(self):
        self.tempo_pomodoro = 25 * 60
        self.pomodoro_ativo = False
        self.label_pomodoro = ttk.Label(self.pomodoro_frame, text="25:00", font=('Helvetica', 36, 'bold'))
        self.label_pomodoro.pack(pady=30)

        ttk.Label(self.pomodoro_frame, text="Tempo personalizado (minutos):",
                  font=('Helvetica', 12)).pack(pady=5)
        self.entrada_pomodoro = ttk.Entry(self.pomodoro_frame, width=10)
        self.entrada_pomodoro.pack(pady=5)

        ttk.Button(self.pomodoro_frame, text="Iniciar Personalizado",
                   command=self.iniciar_pomodoro_personalizado).pack(pady=5)
        ttk.Button(self.pomodoro_frame, text="Iniciar Pomodoro (25 min)",
                   command=self.iniciar_pomodoro_padrao).pack(pady=5)
        ttk.Button(self.pomodoro_frame, text="Parar", command=self.parar_pomodoro).pack(pady=5)
        ttk.Button(self.pomodoro_frame, text="Resetar", command=self.resetar_pomodoro).pack(pady=5)

    def definir_alarme(self):
        hora_alarme = self.entrada_hora.get()
        try:
            hora_alarme = datetime.datetime.strptime(hora_alarme, "%H:%M")
            messagebox.showinfo("Alarme Definido", f"Alarme definido para {hora_alarme.strftime('%H:%M')}")
            self.alarme_ativo = True
            self.thread_alarme = threading.Thread(target=self.iniciar_alarme, args=(hora_alarme,))
            self.thread_alarme.start()
            self.botao_parar_alarme.config(state=tk.NORMAL)
        except ValueError:
            messagebox.showerror("Erro", "Formato de hora inválido. Use HH:MM")

    def iniciar_alarme(self, hora_alarme):
        while self.alarme_ativo:
            agora = datetime.datetime.now()
            if agora.hour == hora_alarme.hour and agora.minute == hora_alarme.minute:
                self.tocar_alarme()
                break
            time.sleep(30)

    def tocar_alarme(self):
        for _ in range(5):
            if not self.alarme_ativo:
                break
            winsound.Beep(1000, 1000)
            time.sleep(0.5)

    def parar_alarme(self):
        self.alarme_ativo = False
        self.botao_parar_alarme.config(state=tk.DISABLED)
        messagebox.showinfo("Alarme Parado", "O alarme foi desativado.")

    def testar_som(self):
        winsound.Beep(1000, 1000)

    def toggle_cronometro(self):
        if self.cronometro_ativo:
            self.cronometro_ativo = False
        else:
            self.cronometro_ativo = True
            threading.Thread(target=self.atualizar_cronometro).start()

    def atualizar_cronometro(self):
        while self.cronometro_ativo:
            self.tempo_cronometro += 1
            minutos, segundos = divmod(self.tempo_cronometro, 60)
            horas, minutos = divmod(minutos, 60)
            self.label_cronometro.config(text=f"{horas:02d}:{minutos:02d}:{segundos:02d}")
            time.sleep(1)

    def resetar_cronometro(self):
        self.cronometro_ativo = False
        self.tempo_cronometro = 0
        self.label_cronometro.config(text="00:00:00")

    def iniciar_pomodoro_personalizado(self):
        try:
            minutos = int(self.entrada_pomodoro.get())
            self.tempo_pomodoro = minutos * 60
            self.iniciar_pomodoro()
        except ValueError:
            messagebox.showerror("Erro", "Por favor, insira um número válido de minutos.")

    def iniciar_pomodoro_padrao(self):
        self.tempo_pomodoro = 25 * 60
        self.iniciar_pomodoro()

    def iniciar_pomodoro(self):
        self.pomodoro_ativo = True
        threading.Thread(target=self.atualizar_pomodoro).start()

    def parar_pomodoro(self):
        self.pomodoro_ativo = False

    def atualizar_pomodoro(self):
        while self.pomodoro_ativo and self.tempo_pomodoro > 0:
            minutos, segundos = divmod(self.tempo_pomodoro, 60)
            self.label_pomodoro.config(text=f"{minutos:02d}:{segundos:02d}")
            self.tempo_pomodoro -= 1
            time.sleep(1)
        if self.tempo_pomodoro == 0:
            self.tocar_alarme()
            messagebox.showinfo("Pomodoro", "Tempo finalizado!")
            self.resetar_pomodoro()

    def resetar_pomodoro(self):
        self.pomodoro_ativo = False
        self.tempo_pomodoro = 25 * 60
        self.label_pomodoro.config(text="25:00")

root = tk.Tk()
app = DespertadorApp(root)
root.mainloop()