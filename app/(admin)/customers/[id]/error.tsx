"use client";

export default function Error({ error }: { error: Error }) {
    return (
        <div>
            <h1>Error. Loading Customers</h1>
            <p>{error.message}</p>
            <button onClick={() => location.reload()}>Try again</button>
        </div>
    );
}