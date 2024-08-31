(defun hello-world () (format t "hello, world!"))
(defun make-cd (title artist rating ripped)
    (list :title title :artist artist :rating rating :ripped ripped))
(defvar *db* nil)
(defun add-record (cd) (push cd *db*))
(defun dump-db ()
    (dolist (cd *db*)
        (format t "~{~a:~10t~a~%~}~%" cd)
    )
)
(defun prompt-read (prompt)
    (format *query-io* "~a: " prompt)
    (force-output *query-io*)
    (read-line *query-io*)
)

(defun prompt-for-cd ()
    (make-cd
        (prompt-read "Title")
        (prompt-read "Artist")
        (or (parse-integer (prompt-read "Rating") :junk-allowed t) 0)
        (y-or-n-p "Ripped [y/n]: ")
    )
)
(defun add-cds ()
    (loop (add-record (prompt-for-cd))
        (if (not (y-or-n-p "Another? [y/n]: ")) (return))
    )
)
(defun save-db (filename)
    (with-open-file (out filename
            :direction :output
            :if-exists :supersede)
        (with-standard-io-syntax
            (print *db* out)
        )
    )
)
(defun load-db (filename)
    (with-open-file (in filename)
        (with-standard-io-syntax
            (setf *db* (read in))
        )
    )
)
(defun select (selector-fn)
    (remove-if-not
        selector-fn *db*
    )
)
(defun artist-selector (artist)
    #'(lambda (cd) (equal (getf cd :artist) artist))
)

(defun where 
    (&key title artist rating (ripped nil ripped-p))
    #'(lambda (cd)
        (and
            (if title (equal (getf cd :title) title) t)
            (if artist (equal (getf cd :artist) artist) t)
            (if rating (equal (getf cd :rating) rating) t)
            (if ripped-p (equal (getf cd :ripped) ripped) t)   
        )
    )
)

(defun my-length (list)
    (if list 
        (1+ (my-length (cdr list)))
    0)
)

(defun pudding-eater (person)
    (cond
        ((eq person 'henry)
            (setf *arch-enemy* 'stupid-lisp-alien)
            '(curse you lisp alien - you ate my pudding))
        ((eq person 'johnny)
            (setf *arch-enemy* 'useless-old-johnny)
            '(i hope you choked on my pudding johnny))
        (t '(why you eat my pudding stranger ?))
    )
)

(defun pudding-eater (person)
    (case person
        ((henry)
            (setf *arch-enemy* 'stupid-lisp-alien)
            '(curse you lisp alien - you ate my pudding)
        )
        ((johnny)
            (setf *arch-enemy* 'useless-old-johnny)
            '(i hope you choked on my pudding johnny)
        )
        (otherwise
            '(why you eat my pudding stranger ?)
        )
    )
)



(defparameter *nodes*
    '(
        (living-room (you are in the living-room. a wizard is snoring loudly on the couch.))
        (garden (you are in a beautiful garden. there is a well in front of you.))
        (attic (you are in the attic. there is a giant welding torch in the corner.))
    )
)

(defun describe-location (location nodes)
    (cadr (assoc location nodes))
)

(defparameter *edges* 
    '(
        (living-room (garden west door) (attic upstairs ladder))
        (garden (living-room east door))
        (attic (living-room downstairs ladder))
    )
)

(defun describe-path (edge)
    `(there is a ,(caddr edge) going ,(cadr edge) from here.)
)