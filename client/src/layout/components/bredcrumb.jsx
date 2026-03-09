import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Breadcrumb() {
    const location = useLocation();
    const [page, setPage] = useState("");
    const pathnames = location.pathname.split("/").filter((x) => x);

    useEffect(() => {
        const pageName = pathnames && pathnames.length > 0 ? pathnames[pathnames.length - 1] : "dashboard";
        // Handle kebab-case to Title Case
        const formatted = pageName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        setPage(formatted);
    }, [pathnames]);

    return (
        <div className="mb-4">
            <div className="card bredcrumb-card shadow-sm border-0 py-2 px-3">
                <div className="breadcrumb-wrapper d-flex align-items-center justify-content-between">
                    <h4 className="page-title m-0 fw-bold">{page}</h4>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb m-0 shadow-none">
                            <li className="breadcrumb-item">
                                <Link to="/" className="text-decoration-none">Home</Link>
                            </li>
                            {pathnames.map((name, index) => {
                                const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
                                const isLast = index === pathnames.length - 1;
                                const formattedName = name
                                    .split('-')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');

                                return isLast ? (
                                    <li className="breadcrumb-item active" aria-current="page" key={name}>
                                        {formattedName}
                                    </li>
                                ) : (
                                    <li className="breadcrumb-item" key={name}>
                                        <Link to={routeTo} className="text-decoration-none">
                                            {formattedName}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Breadcrumb;
