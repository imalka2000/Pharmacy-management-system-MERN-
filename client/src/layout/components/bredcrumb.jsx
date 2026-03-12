import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Breadcrumb() {
    const location = useLocation();
    const [page, setPage] = useState("");
    const pathnames = location.pathname.split("/").filter((x) => x);

    useEffect(() => {
        const pageName = pathnames && pathnames.length > 0 ? pathnames[pathnames.length - 1] : "dashboard";
        const formatted = pageName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        setPage(formatted);
    }, [pathnames]);

    return (
        <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="fw-bold mb-0">{page}</h4>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item small"><Link to="/" className="text-decoration-none text-muted">PharmaCare</Link></li>
                    {pathnames.map((name, index) => {
                        const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
                        const isLast = index === pathnames.length - 1;
                        const formattedName = name
                            .split('-')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');

                        return isLast ? (
                            <li className="breadcrumb-item active small" aria-current="page" key={name}>
                                {formattedName}
                            </li>
                        ) : (
                            <li className="breadcrumb-item small" key={name}>
                                <Link to={routeTo} className="text-decoration-none text-muted">
                                    {formattedName}
                                </Link>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
}

export default Breadcrumb;
