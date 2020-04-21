export interface MoviePoster {
    id: number,
    name: string,
    image: any
}

export interface MovieDetail{
    id?: number,
    name: string,
    image: any,
    duration: number,
    pg_rate: string,
    cast: string,
    synopsis: string,
    end_on_air_date?: Date,
    start_on_air_date?: Date,
    date_schedules?: MovieDateSchedule[]
}

export interface MovieTicketTimeDetail{
    id: number,
    movie_date_schedule_id: number,
    scehdule_date?:Date,
    time: string,
    mst_studio_id: number,
    studio_name: string,
    price: number,
    purchased_ticket: number,
    remaining_ticket: number,
    total_ticket: number
}

export interface MovieDateSchedule{
    id: number,
    date: Date
}
``
export interface PurchaseMovieTicket{
    movie_time_schedule_id: number,
    total_ticket: number,
    total_price: number,
    fullname: string 
}

export interface PublishMovieSchedule{
    movie_id: number,
    schedules: PublishScheduleDetail[]
}

export interface PublishScheduleDetail{
    date: string,
    studio_id: number,
    times: PublishTimeDetail[]
}

export interface PublishTimeDetail{
    time:string,
    price: number,
    total_ticket: number
}

export interface IResponse{
    message?:string,
    error?:boolean
}

export interface UpdateTicketPrice{
    movie_time_schedule_id: number,
    new_price: number
}