import pandas as pd
# Python SQL toolkit and Object Relational Mapper
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template

from flask_sqlalchemy import SQLAlchemy

#################################################
# Database Setup
#################################################
# rds_connection_string = f'postgres:postgres@localhost:5432/movies_db'
# engine = create_engine(f'postgresql://{rds_connection_string}')
url = 'postgres://kkmcxxxwavsdqd:fb334108f7a36d00866d3a010c69877e6821be0b66fb54f99a642229daaa570a@ec2-54-211-169-227.compute-1.amazonaws.com:5432/d7hg3bbhtgeuu2'

engine = sqlalchemy.create_engine(url)
# Initialize the Base object using the automap_base in order to refelect the database.
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

print(Base.classes.keys())

# Save reference to the table
Movie = Base.classes.movie
Genre = Base.classes.genre
mgjunct = Base.classes.movie_genre_junction
country = Base.classes.country_origin
countryjunct = Base.classes.movie_country_junction
companyname = Base.classes.production_company
Profit = Base.classes.profit


# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

db = SQLAlchemy(app)

#################################################
# Flask Routes
#################################################
@app.route("/")
def welcome():
    return render_template('index.html')
        

@app.route("/api/v1.0/movies")
def movie_info():
    movie_info = session.query(Movie.movie_title, Movie.year_published,\
                               Movie.movie_duration, Movie.budget, Movie.usa_gross_income,\
                               Movie.worlwide_gross_income,\
                               country.country_name, country.lat, country.long, Movie.votes_avg,\
                               Genre.genre_name,\
                               companyname.company_name).filter(\
                               Movie.movie_id == countryjunct.movie_id).filter(\
                               Movie.company_id == companyname.company_id).filter(\
                               Movie.movie_id == mgjunct.movie_id).filter(\
                               mgjunct.genre_id == Genre.genre_id).filter(\
                               countryjunct.country_id == country.country_id).\
                               all()

    session.close()
    #Create list of movie information
    movie_list = []
    for title, year, duration, budget, us, worldwide, country_name, lat, lng, avg_votes, genre, company in movie_info:
        movie_dict = {}
        movie_dict['title'] = title
        movie_dict['year_pub'] = year
        movie_dict['duration'] = duration
        movie_dict['budget'] = budget
        movie_dict['us_gross'] = us
        movie_dict['ww_gross'] = worldwide 
        movie_dict['country'] = country_name
        movie_dict['lat'] = lat
        movie_dict['lng'] = lng
        movie_dict['avg_votes'] = avg_votes
        movie_dict['genre'] = genre
        movie_dict['company'] = company
        movie_list.append(movie_dict)

    return jsonify(movie_list)

@app.route("/api/v1.0/profit")
def profit_array():  
    # Query the Heroku Postgres Database to DataFrame for the profit table
    profit_query_stmt = session.query(Profit).statement
    profit_df = pd.read_sql_query(profit_query_stmt, session.bind)
    
    # Iterate through the profit_tb_df to create a list of dictionaries (array of objects) for each row
    profit_list = []
    
    for index, row in profit_df.iterrows():

        # Profit dict
        movie_id = row["movie_id"]
        budget = row["budget"]
        revenue = row["revenue"]
        profit = row["profit"]

        row_profit = {"movie_id": movie_id,
                  "budget": budget,
                  "revenue": revenue,
                  "profit": profit
                 }
        profit_list.append(row_profit)
      
    return jsonify(profit_list)


# @app.route("/api/v1.0/companies")
# def movie_company():
#     movie_info = session.query(Movie.movie_title, Movie.year_published,\
#                                Movie.movie_duration, Movie.budget, Movie.usa_gross_income,\
#                                Movie.worlwide_gross_income, companyname.company_name, Movie.votes_avg).filter(\
#                                Movie.company_id == companyname.company_id).\
#                                limit(100).all()

#     session.close()
#     #Create list of movie information
#     movie_list = []
#     for title, year, duration, budget, us, worldwide, company, avg_votes in movie_info:
#         movie_dict = {}
#         movie_dict['title'] = title
#         movie_dict['year_pub'] = year
#         movie_dict['duration'] = duration
#         movie_dict['budget'] = budget
#         movie_dict['us_gross'] = us
#         movie_dict['ww_gross'] = worldwide 
#         movie_dict['company'] = company
#         movie_dict['avg_votes'] = avg_votes
#         movie_list.append(movie_dict)

#     return jsonify(movie_list)

if __name__ == "__main__":   
    app.run(debug=True)