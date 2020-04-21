import pymysql
from app.app import app
from app.config import mysql
from flask import jsonify, request
from datetime import datetime

def get_response_wrapper(message, error = None, body = None):
    response = {}
    if body is not None: response['body'] = body
    if error is not None: response['error'] = error
    if message is not None: response['message'] = message
    return response


def get_success_response_wrapper(message, body = None):
    return get_response_wrapper(message, None, body)


# INSERT movie
@app.route('/movie', methods=['POST'])
def add_movie():
    try:
        _json = request.json
        _name = _json['name']
        _image = _json['image']
        _synopsis = _json['synopsis']
        _cast = _json['cast']
        _duration = _json['duration']
        _pg_rate = _json['pg_rate']
        if len(_json) == 6 and request.method == 'POST':
            sqlQuery = "INSERT INTO `mst_movie`(`name`, `image`, `synopsis`, `cast`, `duration`, `pg_rate`)" \
                       " VALUES(%s, %s, %s, %s, %s, %s)"
            bindData = (_name, _image,  _synopsis, _cast, _duration, _pg_rate)
            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.execute(sqlQuery, bindData)
            conn.commit()
            response = jsonify(get_response_wrapper('Movie added successfully!'))
            response.status_code = 200
            return response
        else:
            return not_found()

    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


@app.route('/studio', methods=['POST'])
def add_studio():
    try:
        _json = request.json
        _name = _json['name']
        if len(_json) == 1 and request.method == 'POST':
            sqlQuery = "INSERT INTO `mst_studio`(`name`)" \
                       " VALUES(%s)"
            bindData = (_name)
            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.execute(sqlQuery, bindData)
            conn.commit()
            response = jsonify(get_response_wrapper('Studio added successfully!'))
            response.status_code = 200
            return response
        else:
            return not_found()

    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()

@app.route('/studio', methods=['GET'])
def get_studio():
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT id, name FROM mst_studio")
        studioRows = cursor.fetchall()
        response = jsonify(studioRows)
        response.status_code = 200
        return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()

@app.route('/movie/schedule/publish', methods=['POST'])
def publish_movie_schedule():
    try:
        _json = request.json
        movie_id = _json['movie_id']
        _schedules = _json['schedules']

        if _schedules and request.method == 'POST':
            conn = mysql.connect()
            cursor = conn.cursor()

            # Update start on air and end on air date movie
            query_update_air_date_movie = "UPDATE `mst_movie` SET start_on_air_date=%s, end_on_air_date=%s WHERE id=%s"
            bind_data = get_first_and_last_date(_schedules)
            bind_data_arr = list(bind_data)
            bind_data_arr.insert(len(bind_data_arr), movie_id)
            bind_data = tuple(bind_data_arr)

            cursor.execute(query_update_air_date_movie, bind_data)

            if conn.affected_rows() <= 0:
                response = jsonify(get_response_wrapper('Failed to update movie with id: %s !' % (movie_id), True))
                response.status_code = 200
                return response


            # Insert movie schedules
            for schedule in _schedules:
                sqlQueryMovieDateSchedule = "INSERT INTO `movie_date_schedule`(`movie_id`, `date`)" \
                           " VALUES(%s, %s)"
                bindScheduleData = (movie_id, schedule["date"])
                cursor.execute(sqlQueryMovieDateSchedule, bindScheduleData)
                conn.commit()
                movie_date_id = cursor.lastrowid

                for time in schedule["times"]:
                    sqlQueryMovieTimeSchedule = "INSERT INTO `movie_time_schedule`(`movie_date_schedule_id`, `mst_studio_id`,`time`, `price`, `total_ticket`)" \
                               " VALUES(%s, %s, %s, %s, %s)"
                    print(movie_date_id)
                    bindTimeData = (movie_date_id, schedule["studio_id"], time["time"], time["price"], time["total_ticket"])
                    cursor.execute(sqlQueryMovieTimeSchedule, bindTimeData)
                    conn.commit()


            response = jsonify(get_success_response_wrapper("Movie Successfully Pubvlshed !"))
            response.status_code = 200
            return response
        else:
            return not_found()

    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


def get_first_and_last_date(schedules):
    on_air_dates = []
    for schedule in schedules:
        on_air_dates.insert(0, schedule["date"])
    on_air_dates.sort(key=lambda date: datetime.strptime(date, "%Y-%m-%d"))
    return on_air_dates[0], on_air_dates[-1]


@app.route('/movie/schedule/update_price', methods=['PUT'])
def update_price():
    try:
        _json = request.json
        movie_time_schedule_id = _json['movie_time_schedule_id']
        _new_price = _json['new_price']
        if movie_time_schedule_id and _new_price and request.method == 'PUT':
            sqlQuery = "UPDATE `movie_time_schedule` SET price=%s WHERE id=%s"
            bindData = (_new_price, movie_time_schedule_id)
            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.execute(sqlQuery, bindData)
            conn.commit()
            if conn.affected_rows() > 0:
                response = jsonify(get_success_response_wrapper('Ticket Price updated successfully!'))
            else:
                response = jsonify(get_response_wrapper('Failed to update movie with id: %s !' % (movie_time_schedule_id), True))
            response.status_code = 200
            return response
        else:
            return not_found()
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


@app.route('/movie/update', methods=['POST'])
def update_movie():
    try:
        _json = request.json

        # Update remaining ticket
        update_movie_data, bind_data_update = update_movie_query_builder(_json)
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute(update_movie_data, bind_data_update)
        conn.commit()

        response = jsonify(get_success_response_wrapper('Update Movie is success!'))
        response.status_code = 200
        return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


def update_movie_query_builder(json_update_movie):
    query_update = "UPDATE `mst_movie` SET"
    bind_data = []
    if "name" in json_update_movie and json_update_movie["name"] is not None:
        query_update += " name=%s,"
        bind_data.insert(len(bind_data), json_update_movie['name'])
    if "image" in json_update_movie and json_update_movie["image"] is not None:
        query_update += " image=%s,"
        bind_data.insert(len(bind_data),json_update_movie['image'])
    if "synopsis" in json_update_movie and json_update_movie["synopsis"] is not None:
        query_update += " synopsis=%s,"
        bind_data.insert(len(bind_data),json_update_movie['synopsis'])
    if "cast" in json_update_movie and json_update_movie["cast"] is not None:
        query_update += " cast=%s,"
        bind_data.insert(len(bind_data),json_update_movie['cast'])
    if "duration" in json_update_movie and json_update_movie["duration"] is not None:
        query_update += " duration=%s,"
        bind_data.insert(len(bind_data),json_update_movie['duration'])
    if "pg_rate" in json_update_movie and json_update_movie["pg_rate"] is not None:
        query_update += " pg_rate=%s,"
        bind_data.insert(len(bind_data),json_update_movie['pg_rate'])
    query_update = query_update[:-1]
    query_update += " WHERE id=%s"

    bind_data.insert(len(bind_data), json_update_movie['id'])


    return query_update, tuple(bind_data)

@app.route('/movie/<int:id>', methods=['DELETE'])
def delete_movie(id):
    try:
        conn = mysql.connect()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM mst_movie WHERE id =%s", (id))
        conn.commit()
        if conn.affected_rows() > 0:
            response = jsonify(get_success_response_wrapper('Movie deleted successfully!'))
        else:
            response = jsonify(get_response_wrapper('Movie with id: %s not found!' % (id), True))
        response.status_code = 200
        return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()



@app.route('/movie', methods=['GET'])
def get_movie():
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT id, name, image FROM mst_movie")
        movieRows = cursor.fetchall()
        for movieRow in movieRows:
            movieRow["image"] = str(movieRow["image"])
        response = jsonify(movieRows)
        response.status_code = 200
        return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


@app.route('/movie/on_air', methods=['GET'])
def get_on_air_movie():
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT id, name, image FROM mst_movie WHERE CURDATE() BETWEEN start_on_air_date and end_on_air_date OR CURDATE() < start_on_air_date")
        movieRows = cursor.fetchall()
        for movieRow in movieRows:
            movieRow["image"] = str(movieRow["image"])
        response = jsonify(movieRows)
        response.status_code = 200
        return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


@app.route('/movie/<int:movie_id>', methods=['GET'])
def get_movie_detail(movie_id):
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT * FROM mst_movie WHERE id=%s"% (movie_id) )
        movieRow = cursor.fetchone()
        movieRow["image"] = str(movieRow["image"])

        cursor.execute("SELECT * FROM movie_date_schedule WHERE movie_id=%s" % (movie_id))
        dateRows = cursor.fetchall()
        for dateRow in dateRows:
            del dateRow["movie_id"]
        movieRow["date_schedules"] = dateRows


        response = jsonify(movieRow)
        response.status_code = 200
        return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


@app.route('/movie/ticket_detail/<int:movie_date_schedule_id>', methods=['GET'])
def get_movie_ticket_detail(movie_date_schedule_id):
    try:
        conn = mysql.connect()
        cursor = conn.cursor(pymysql.cursors.DictCursor)
        cursor.execute("SELECT mts.*, ms.name as studio_name FROM movie_time_schedule as mts JOIN mst_studio as ms ON mts.mst_studio_id = ms.id WHERE mts.movie_date_schedule_id=%s", (movie_date_schedule_id))
        ticket_rows = cursor.fetchall()
        for ticket_row in ticket_rows:
            purchased_ticket = 0
            ticket_row["time"] = str(ticket_row["time"])
            if ticket_row['purchased_ticket'] is not None:
                ticket_row['purchased_ticket'] = int(ticket_row['purchased_ticket'])
                purchased_ticket = int(ticket_row['purchased_ticket'])
            else:
                ticket_row['purchased_ticket'] = 0
            ticket_row['remaining_ticket'] = int(ticket_row['total_ticket']) - purchased_ticket

        response = jsonify(ticket_rows)
        response.status_code = 200
        return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


@app.route('/movie/purchase_ticket', methods=['POST'])
def purchase_movie_ticket():
    try:
        _json = request.json
        movie_time_schedule_id = _json['movie_time_schedule_id']
        fullname = _json['fullname']
        total_ticket = _json['total_ticket']
        total_price = _json['total_price']
        conn = mysql.connect()
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        if is_remaining_ticket_enough(movie_time_schedule_id, total_ticket):
            # Update remaining ticket first
            update_ticket_remaining_query = "UPDATE `movie_time_schedule` SET purchased_ticket= IFNULL(purchased_ticket, 0) + %s WHERE id=%s"
            bind_update_data = (total_ticket, movie_time_schedule_id)
            conn = mysql.connect()
            cursor = conn.cursor()
            cursor.execute(update_ticket_remaining_query, bind_update_data)
            conn.commit()
            if conn.affected_rows() <= 0:
                response = jsonify(get_response_wrapper('Failed to purchase ticket movie !', True))
                return response

            # Insert to transacation afterwards
            sql_insert_ticket_purchase = "INSERT INTO `transaction`(`id`, `movie_time_schedule_id`, `customer_name`, `total_ticket`,`total_price`)" \
                       " VALUES(%s, %s, %s, %s, %s)"
            bind_insert_data = (generate_transaction_id(movie_time_schedule_id, total_ticket), movie_time_schedule_id, fullname, total_ticket, total_price)
            cursor.execute(sql_insert_ticket_purchase, bind_insert_data)
            conn.commit()
            if conn.affected_rows() <= 0:
                response = jsonify(get_response_wrapper('Failed to purchase ticket movie !', True))
                return response

            response = jsonify(get_success_response_wrapper('Purchase Ticket is success!'))
            response.status_code = 200
            return response
        else:
            response = jsonify(get_response_wrapper("Can't purchase ticket more than stock ticket ! ", True))
            response.status_code = 200
            return response
    except Exception as e:
        print(e)
    finally:
        cursor.close()
        conn.close()


def is_remaining_ticket_enough(movie_time_schedule_id, total_ticket):
    conn = mysql.connect()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute("SELECT total_ticket, purchased_ticket FROM `movie_time_schedule` WHERE id=%s" % (movie_time_schedule_id))
    movie_ticket_rows = cursor.fetchall()
    purchased_ticket = 0
    if movie_ticket_rows[0]["purchased_ticket"] is not None: purchased_ticket = int(movie_ticket_rows[0]["purchased_ticket"])
    return (int(movie_ticket_rows[0]["total_ticket"]) - purchased_ticket) >= total_ticket


def generate_transaction_id(movie_time_schedule_id, total_ticket):
    return "T" + str(movie_time_schedule_id) + str(total_ticket) + datetime.now().strftime("%d%m%Y%H%M%S")


@app.errorhandler(404)
def not_found(error=None):
    message = {
        'status': 404,
        'message': 'Record not found: ' + request.url,
    }
    response = jsonify(message)
    response.status_code = 404
    return response


if __name__ == "__main__":
    app.run()