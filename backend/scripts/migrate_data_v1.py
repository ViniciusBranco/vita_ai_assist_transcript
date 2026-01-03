import psycopg2
from psycopg2.extras import RealDictCursor

# Configurações de Conexão
SRC_DB = "dbname=vita_transcript user=user password=pass host=localhost port=5432"
DST_DB = "dbname=vita_ai_db user=user password=pass host=localhost port=5432"

def migrate():
    try:
        src_conn = psycopg2.connect(SRC_DB)
        dst_conn = psycopg2.connect(DST_DB)
        
        with src_conn.cursor(cursor_factory=RealDictCursor) as src_cur, \
             dst_conn.cursor() as dst_cur:
            
            # 1. Migrar Pacientes
            src_cur.execute("SELECT * FROM patients")
            patients = src_cur.fetchall()
            for p in patients:
                dst_cur.execute(
                    "INSERT INTO patients (id, name, cpf, phone, birth_date, aliases, created_at) "
                    "VALUES (%s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING",
                    (p['id'], p['name'], p['cpf'], p['phone'], p['birth_date'], p.get('aliases', []), p['created_at'])
                )
            print(f"✅ {len(patients)} pacientes migrados.")

            # 2. Migrar Consultas (Appointments)
            src_cur.execute("SELECT * FROM appointments")
            apps = src_cur.fetchall()
            for a in apps:
                dst_cur.execute(
                    "INSERT INTO appointments (id, patient_id, date_time, status, created_at) "
                    "VALUES (%s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING",
                    (a['id'], a['patient_id'], a['date_time'], a['status'], a['created_at'])
                )
            print(f"✅ {len(apps)} consultas migradas.")

            # 3. Migrar Prontuários (Medical Records)
            src_cur.execute("SELECT * FROM medical_records")
            records = src_cur.fetchall()
            for r in records:
                dst_cur.execute(
                    "INSERT INTO medical_records (id, appointment_id, record_type, structured_content, full_transcription, created_at) "
                    "VALUES (%s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING",
                    (r['id'], r['appointment_id'], r['record_type'], psycopg2.extras.Json(r['structured_content']), r['full_transcription'], r['created_at'])
                )
            print(f"✅ {len(records)} prontuários migrados.")

            dst_conn.commit()
            print("🚀 Migração concluída com sucesso!")

    except Exception as e:
        print(f"❌ Erro na migração: {e}")
    finally:
        if 'src_conn' in locals(): src_conn.close()
        if 'dst_conn' in locals(): dst_conn.close()

if __name__ == "__main__":
    migrate()