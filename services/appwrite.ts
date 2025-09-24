//track searches by user

import { Client, ID, Query, TablesDB } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const METRICS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_METRICS_TABLE_ID!;

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!)

const tablesDB = new TablesDB(client);


export const updateSearchCount = async (query: string = '', movie: Movie) => {
    try {
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: METRICS_TABLE_ID,
            queries: [
                Query.equal('searchTerm', query)
            ]
        });

        if (result.total > 0) {
            // update the row with incremented id
            const result_update = await tablesDB.incrementRowColumn({
                databaseId: DATABASE_ID,
                tableId: METRICS_TABLE_ID,
                rowId: result.rows[0].$id,
                column: 'count',
                value: 1
            });
        } else {
            // create new row with count = 1
            const result_new = await tablesDB.createRow({
                databaseId: DATABASE_ID,
                tableId: METRICS_TABLE_ID,
                rowId: ID.unique(),
                data: {
                    "searchTerm": query,
                    "count": 1,
                    "url": `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
                    "movie_id": movie.id,
                    "title": movie.title
                }
            });
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
    

    // check if a record of search has been stored
    // if found increment the searchCount field
    // if not found create a new record with searchCount set to 1
}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await tablesDB.listRows({
            databaseId: DATABASE_ID,
            tableId: METRICS_TABLE_ID,
            queries: [
                Query.limit(5),
                Query.orderDesc('count'),
            ]
        });

        return result.rows as unknown as TrendingMovie[];
    } catch (error) {
        console.log(error);
        return undefined;
    }
};