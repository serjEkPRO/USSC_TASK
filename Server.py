from flask import Flask, jsonify, request
from flask_cors import CORS
import pg8000
import logging, json
from contextlib import contextmanager

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*"}})

# Настройка подключения к базе данных
db_config = {
    "host": "10.41.55.60",
    "database": "soar_struct",
    "user": "postgres",
    "password": "852456"
}

logging.basicConfig(level=logging.ERROR)

# Контекстный менеджер для подключения к базе данных
@contextmanager
def get_db_connection():
    conn = pg8000.connect(**db_config)
    try:
        yield conn
    finally:
        conn.close()

@app.route('/api/organizations', methods=['POST'])
def create_organization():
    try:
        data = request.json
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO organization (name) VALUES (%s) RETURNING id, name", (name,))
            organization = cur.fetchone()
            conn.commit()
        return jsonify({"id": organization[0], "name": organization[1]})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error creating organization: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/categories', methods=['POST'])
def create_category():
    try:
        data = request.json
        organization_id = data['organization_id']
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO incident_category (organization_id, name) VALUES (%s, %s) RETURNING id, organization_id, name", (organization_id, name))
            category = cur.fetchone()
            conn.commit()
        return jsonify({"id": category[0], "organization_id": category[1], "name": category[2]})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error creating category: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/types', methods=['POST'])
def create_type():
    try:
        data = request.json
        category_id = data['category_id']
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO incident_type (category_id, name) VALUES (%s, %s) RETURNING id, category_id, name", (category_id, name))
            incident_type = cur.fetchone()
            conn.commit()
        return jsonify({"id": incident_type[0], "category_id": incident_type[1], "name": incident_type[2]})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error creating type: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/fields', methods=['POST'])
def add_fields():
    try:
        data = request.json
        type_id = data['type_id']
        fields = data['fields']
        results = []
        with get_db_connection() as conn:
            cur = conn.cursor()
            for field in fields:
                name = field.get('name')
                field_type = field.get('field_type')
                dropdown_values = field.get('dropdown_values')
                dictionary_id = field.get('dictionary_id')
                if name and field_type:
                    cur.execute("""
                        INSERT INTO incident_field (type_id, name, field_type, dropdown_values, dictionary_id) 
                        VALUES (%s, %s, %s, %s, %s) 
                        RETURNING id, type_id, name, field_type, dropdown_values, dictionary_id
                        """, (type_id, name, field_type, dropdown_values, dictionary_id))
                    incident_field = cur.fetchone()
                    results.append({
                        "id": incident_field[0],
                        "type_id": incident_field[1],
                        "name": incident_field[2],
                        "field_type": incident_field[3],
                        "dropdown_values": incident_field[4],
                        "dictionary_id": incident_field[5]
                    })
            conn.commit()
        return jsonify(results)
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error adding fields: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/organizations', methods=['GET'])
def get_organizations():
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM organization")
            organizations = cur.fetchall()
        return jsonify([{"id": org[0], "name": org[1]} for org in organizations])
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching organizations: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/categories/<int:organization_id>', methods=['GET'])
def get_categories(organization_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM incident_category WHERE organization_id = %s", (organization_id,))
            categories = cur.fetchall()
        return jsonify([{"id": cat[0], "name": cat[1]} for cat in categories])
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching categories: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/types/<int:category_id>', methods=['GET'])
def get_types(category_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM incident_type WHERE category_id = %s", (category_id,))
            types = cur.fetchall()
        return jsonify([{"id": typ[0], "name": typ[1]} for typ in types])
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching types: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500



@app.route('/api/dictionaries', methods=['POST'])
def create_dictionary():
    try:
        data = request.json
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO dictionary (name) VALUES (%s) RETURNING id, name", (name,))
            dictionary = cur.fetchone()
            conn.commit()
        return jsonify({"id": dictionary[0], "name": dictionary[1]})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error creating dictionary: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/attributes', methods=['POST'])
def create_attribute():
    try:
        data = request.json
        dictionary_id = data['dictionary_id']
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("INSERT INTO dictionary_attribute (dictionary_id, name) VALUES (%s, %s) RETURNING id, dictionary_id, name", (dictionary_id, name))
            attribute = cur.fetchone()
            conn.commit()
        return jsonify({"id": attribute[0], "dictionary_id": attribute[1], "name": attribute[2]})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error creating attribute: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/dictionaries', methods=['GET'])
def get_dictionaries():
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM dictionary")
            dictionaries = cur.fetchall()
        return jsonify([{"id": dict[0], "name": dict[1]} for dict in dictionaries])
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching dictionaries: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/attributes/<int:dictionary_id>', methods=['GET'])
def get_attributes(dictionary_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM dictionary_attribute WHERE dictionary_id = %s", (dictionary_id,))
            attributes = cur.fetchall()
        return jsonify([{"id": attr[0], "name": attr[1]} for attr in attributes])
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching attributes: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/dictionaries/<int:dictionary_id>', methods=['DELETE'])
def delete_dictionary(dictionary_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM dictionary WHERE id = %s", (dictionary_id,))
            conn.commit()
        return jsonify({"message": "Справочник и все связанные атрибуты удалены"}), 200
    except Exception as e:
        logging.error(f"Error deleting dictionary: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/attributes/<int:attribute_id>', methods=['DELETE'])
def delete_attribute(attribute_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM dictionary_attribute WHERE id = %s", (attribute_id,))
            conn.commit()
        return jsonify({"message": "Атрибут удален"}), 200
    except Exception as e:
        logging.error(f"Error deleting attribute: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/fields/<int:field_id>', methods=['DELETE'])
def delete_field(field_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM incident_field WHERE id = %s", (field_id,))
            conn.commit()
        return jsonify({"message": "Поле удалено"}), 200
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error deleting field: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/organizations/<int:organization_id>', methods=['DELETE'])
def delete_organization(organization_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM organization WHERE id = %s", (organization_id,))
            conn.commit()
        return jsonify({"message": "Организация удалена"}), 200
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error deleting organization: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM incident_category WHERE id = %s", (category_id,))
            conn.commit()
        return jsonify({"message": "Категория удалена"}), 200
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error deleting category: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/types/<int:type_id>', methods=['DELETE'])
def delete_type(type_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("DELETE FROM incident_type WHERE id = %s", (type_id,))
            conn.commit()
        return jsonify({"message": "Тип удален"}), 200
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error deleting type: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/organizations/<int:organization_id>', methods=['PUT'])
def update_organization_name(organization_id):
    try:
        data = request.json
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("UPDATE organization SET name = %s WHERE id = %s", (name, organization_id))
            conn.commit()
        return jsonify({"id": organization_id, "name": name})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error updating organization name: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/categories/<int:category_id>', methods=['PUT'])
def update_category_name(category_id):
    try:
        data = request.json
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("UPDATE incident_category SET name = %s WHERE id = %s", (name, category_id))
            conn.commit()
        return jsonify({"id": category_id, "name": name})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error updating category name: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/types/<int:type_id>', methods=['PUT'])
def update_type_name(type_id):
    try:
        data = request.json
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("UPDATE incident_type SET name = %s WHERE id = %s", (name, type_id))
            conn.commit()
        return jsonify({"id": type_id, "name": name})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error updating type name: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/fields/<int:field_id>', methods=['PUT'])
def update_field_name(field_id):
    try:
        data = request.json
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("UPDATE incident_field SET name = %s WHERE id = %s", (name, field_id))
            conn.commit()
        return jsonify({"id": field_id, "name": name})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error updating field name: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/dictionaries/<int:dictionary_id>', methods=['PUT'])
def update_dictionary_name(dictionary_id):
    try:
        data = request.json
        name = data['name']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("UPDATE dictionary SET name = %s WHERE id = %s", (name, dictionary_id))
            conn.commit()
        return jsonify({"id": dictionary_id, "name": name})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error updating dictionary name: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/fields/<int:field_id>/dictionary', methods=['PUT'])
def update_field_dictionary(field_id):
    try:
        data = request.json
        dictionary_id = data['dictionary_id']
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("UPDATE incident_field SET dictionary_id = %s WHERE id = %s", (dictionary_id, field_id))
            conn.commit()
        return jsonify({"id": field_id, "dictionary_id": dictionary_id})
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error updating field dictionary: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500


def map_field_type(field_type):
    field_type_mapping = {
        'text': 'VARCHAR(255)',
        'checkbox': 'BOOLEAN',
        'date': 'DATE',
        'number': 'INTEGER',
        'dropdown': 'VARCHAR(255)',
        'dictionary': 'VARCHAR(255)'  # Assuming dictionary is stored as a string
    }
    return field_type_mapping.get(field_type, 'VARCHAR(255)')

def create_table_for_incident_type(type_id, fields):
    table_name = f"incident_type_{type_id}"
    with get_db_connection() as conn:
        cur = conn.cursor()
        cur.execute(f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                id SERIAL PRIMARY KEY,
                organization_id INTEGER REFERENCES organization(id),
                category_id INTEGER REFERENCES incident_category(id),
                type_id INTEGER REFERENCES incident_type(id),
                creator VARCHAR(255),
                responsible VARCHAR(255),
                evidence_link VARCHAR(255),
                evidence_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        for field in fields:
            field_name = field[0]
            field_type = map_field_type(field[1])
            cur.execute(f"""
                ALTER TABLE {table_name}
                ADD COLUMN IF NOT EXISTS "{field_name}" {field_type}
            """)
        conn.commit()


def table_exists(cur, table_name):
    cur.execute(f"""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '{table_name}'
        );
    """)
    return cur.fetchone()[0]


@app.route('/api/incidents', methods=['POST'])
def create_incident():
    try:
        data = request.json
        logging.info(f"Received request data: {json.dumps(data, indent=2, ensure_ascii=False)}")

        required_fields = ['organization_id', 'category_id', 'type_id', 'creator', 'responsible', 'evidence_link', 'evidence_name']
        missing_fields = [field for field in required_fields if field not in data]

        if missing_fields:
            logging.error(f"Missing required fields: {missing_fields}")
            return jsonify({"error": f"Missing required fields: {missing_fields}"}), 400

        organization_id = data['organization_id']
        category_id = data['category_id']
        type_id = data['type_id']
        creator = data['creator']
        responsible = data['responsible']
        evidence_link = data['evidence_link']
        evidence_name = data['evidence_name']

        custom_fields = {k: v for k, v in data.items() if k not in required_fields + ['created_at', 'updated_at']}
        logging.info(f"Custom fields: {json.dumps(custom_fields, indent=2, ensure_ascii=False)}")

        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT name, field_type FROM incident_field WHERE type_id = %s", (type_id,))
            fields = cur.fetchall()

        create_table_for_incident_type(type_id, fields)

        field_names = ', '.join([f'"{f[0]}"' for f in fields if f[0] in custom_fields])
        placeholders = ', '.join(['%s'] * len(fields))
        insert_query = f"""
            INSERT INTO incident_type_{type_id} (organization_id, category_id, type_id, creator, responsible, evidence_link, evidence_name, {field_names})
            VALUES (%s, %s, %s, %s, %s, %s, %s, {placeholders})
            RETURNING id, created_at, updated_at
        """
        values = [organization_id, category_id, type_id, creator, responsible, evidence_link, evidence_name] + [custom_fields[f[0]] for f in fields if f[0] in custom_fields]
        logging.info(f"Insert query: {insert_query}")
        logging.info(f"Values: {values}")

        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute(insert_query, values)
            incident = cur.fetchone()
            conn.commit()

        return jsonify({
            "id": incident[0],
            "created_at": incident[1],
            "updated_at": incident[2]
        })
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error creating incident: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    try:
        incidents = []
        incident_fields = []
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT id, name FROM incident_type")
            types = cur.fetchall()
            for type_id, type_name in types:
                table_name = f"incident_type_{type_id}"
                if table_exists(cur, table_name):
                    cur.execute(f"SELECT * FROM {table_name}")
                    rows = cur.fetchall()
                    columns = [desc[0] for desc in cur.description]
                    incident_fields.extend([col for col in columns if col not in incident_fields])
                    for row in rows:
                        incident = {columns[i]: row[i] for i in range(len(columns))}
                        incidents.append(incident)
        return jsonify({
            "incidents": incidents,
            "fields": incident_fields
        })
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching incidents: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500


@app.route('/api/fields/<int:type_id>', methods=['GET'])
def get_fields(type_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT f.id, f.name, f.field_type, f.dropdown_values, f.dictionary_id
                FROM incident_field f
                WHERE f.type_id = %s
            """, (type_id,))
            fields = cur.fetchall()
        result = []
        for field in fields:
            field_data = {
                "id": field[0],
                "name": field[1],
                "field_type": field[2],
                "dropdown_values": field[3] if field[3] else [],
                "dictionary_id": field[4]
            }
            result.append(field_data)
        return jsonify(result)
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching fields: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/dictionary/<int:dictionary_id>/values', methods=['GET'])
def get_dictionary_values(dictionary_id):
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT name FROM dictionary_attribute
                WHERE dictionary_id = %s
            """, (dictionary_id,))
            values = cur.fetchall()
        return jsonify([value[0] for value in values])
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching dictionary values: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500

@app.route('/api/fields', methods=['GET'])
def get_all_fields():
    try:
        with get_db_connection() as conn:
            cur = conn.cursor()
            cur.execute("SELECT DISTINCT name FROM incident_field")
            fields = cur.fetchall()
        return jsonify([field[0] for field in fields])
    except pg8000.dbapi.DatabaseError as e:
        logging.error(f"Error fetching fields: {str(e)}")
        return jsonify({"error": str(e), "details": e.args}), 500
if __name__ == '__main__':
    app.run(debug=True)
